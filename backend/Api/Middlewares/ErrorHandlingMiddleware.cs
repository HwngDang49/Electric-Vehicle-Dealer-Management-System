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
                    problem = new ValidationProblemDetails(fvEx.Errors
                        .GroupBy(e => e.PropertyName)
                        .ToDictionary(g => g.Key, g => g.Select(x => x.ErrorMessage).ToArray()))
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

            var json = JsonSerializer.Serialize(problem, new JsonSerializerOptions
            {
                PropertyNamingPolicy = JsonNamingPolicy.CamelCase,
                WriteIndented = false
            });

            await ctx.Response.WriteAsync(json);
        }
    }
}
