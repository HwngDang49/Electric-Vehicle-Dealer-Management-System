using System.Net;
using System.Text.Json;
using FluentValidation;
using Microsoft.AspNetCore.Mvc;


namespace backend.Api.Middlewares
{
    public sealed class ErrorHandlingMiddleware
    {
        private readonly RequestDelegate _next;
        private readonly ILogger<ErrorHandlingMiddleware> _logger;

        public ErrorHandlingMiddleware(RequestDelegate next, ILogger<ErrorHandlingMiddleware> logger)
        {
            _next = next; _logger = logger;
        }

        public async Task Invoke(HttpContext ctx)
        {
            try
            {
                await _next(ctx);
            }
            catch (Exception ex)
            {
                await WriteProblem(ctx, ex);
            }
        }

        private async Task WriteProblem(HttpContext ctx, Exception ex)
        {
            var traceId = ctx.TraceIdentifier;
            ProblemDetails problem;
            int status;

            switch (ex)
            {
                case ValidationException fvEx:
                    status = (int)HttpStatusCode.BadRequest;
                    var validationErrors = fvEx.Errors
                        .GroupBy(e => e.PropertyName)
                        .ToDictionary(g => g.Key, g => g.Select(x => x.ErrorMessage).ToArray());
                    
                    problem = new ValidationProblemDetails(validationErrors)
                    {
                        Title = "One or more validation errors occurred.",
                        Status = status,
                        Detail = "The request is invalid.",
                        Instance = ctx.Request.Path,
                        Extensions = { ["traceId"] = traceId }
                    };
                    break;

                case backend.Common.Exceptions.NotFoundException nfEx:
                    status = (int)HttpStatusCode.NotFound;
                    problem = new ProblemDetails
                    {
                        Title = "Resource was not found.",
                        Status = status,
                        Detail = nfEx.Message,
                        Instance = ctx.Request.Path,
                        Extensions = { ["traceId"] = traceId }
                    };
                    break;

                case backend.Common.Exceptions.BusinessRuleException brEx:
                    status = (int)HttpStatusCode.Conflict;
                    problem = new ProblemDetails
                    {
                        Title = "Business rule violation.",
                        Status = status,
                        Detail = brEx.Message,
                        Instance = ctx.Request.Path,
                        Extensions = { ["traceId"] = traceId }
                    };
                    break;

                case UnauthorizedAccessException uaEx:
                    status = StatusCodes.Status401Unauthorized;
                    problem = new ProblemDetails
                    {
                        Title = "Unauthorized",
                        Status = status,
                        Detail = uaEx.Message,
                        Instance = ctx.Request.Path,
                        Extensions = { ["traceId"] = traceId }
                    };
                    break;

                default:
                    status = (int)HttpStatusCode.InternalServerError;
                    _logger.LogError(ex, "Unhandled error (traceId: {TraceId})", traceId);
                    problem = new ProblemDetails
                    {
                        Title = "An unexpected error occurred.",
                        Status = status,
                        Detail = "Please contact support with the provided traceId.",
                        Instance = ctx.Request.Path,
                        Extensions = { ["traceId"] = traceId }
                    };
                    break;
            }

            ctx.Response.ContentType = "application/problem+json";
            ctx.Response.StatusCode = status;

            // For ValidationProblemDetails, ensure Errors dictionary is properly serialized
            string json;
            if (problem is ValidationProblemDetails validationProblem)
            {
                // Create a custom object that ensures Errors is serialized correctly
                var responseObj = new
                {
                    type = problem.Type,
                    title = problem.Title,
                    status = problem.Status,
                    detail = problem.Detail,
                    instance = problem.Instance,
                    errors = validationProblem.Errors, // Explicitly include errors
                    traceId = traceId
                };
                
                json = JsonSerializer.Serialize(responseObj, new JsonSerializerOptions
                {
                    PropertyNamingPolicy = JsonNamingPolicy.CamelCase,
                    WriteIndented = false
                });
            }
            else
            {
                json = JsonSerializer.Serialize(problem, new JsonSerializerOptions
                {
                    PropertyNamingPolicy = JsonNamingPolicy.CamelCase,
                    WriteIndented = false
                });
            }

            await ctx.Response.WriteAsync(json);
        }
    }
}
