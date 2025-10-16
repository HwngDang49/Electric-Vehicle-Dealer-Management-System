using Ardalis.Result;
using Microsoft.AspNetCore.Mvc;
namespace backend.Common.Paging
{
    public static class ResultExtensions
    {
        public static IActionResult ToActionResult<T>(this ControllerBase ctrl, Result<T> result)
        {
            switch (result.Status)
            {
                case ResultStatus.Ok:
                    return ctrl.Ok(result.Value);

                case ResultStatus.Created:
                    return ctrl.Created(string.Empty, result.Value);

                case ResultStatus.NotFound:
                    return ctrl.Problem(
                        title: "Resource was not found.",
                        statusCode: StatusCodes.Status404NotFound,
                        detail: string.Join("; ", result.Errors ?? Enumerable.Empty<string>()));

                case ResultStatus.Unauthorized:
                    return ctrl.Problem(
                        title: "Unauthorized",
                        statusCode: StatusCodes.Status401Unauthorized,
                        detail: string.Join("; ", result.Errors ?? Enumerable.Empty<string>()));

                case ResultStatus.Forbidden:
                    return ctrl.Problem(
                        title: "Forbidden",
                        statusCode: StatusCodes.Status403Forbidden,
                        detail: string.Join("; ", result.Errors ?? Enumerable.Empty<string>()));

                case ResultStatus.Invalid:
                    {
                        // Gom lỗi: ưu tiên ValidationErrors; nếu không có thì dùng Errors
                        var errorsDict =
                            result.ValidationErrors?.GroupBy(e => e.Identifier ?? string.Empty)
                                .ToDictionary(
                                    g => g.Key,
                                    g => g.Select(x => string.IsNullOrWhiteSpace(x.ErrorMessage) ? "Invalid" : x.ErrorMessage)
                                          .ToArray()
                                )
                            ?? (result.Errors != null && result.Errors.Any()
                                ? new Dictionary<string, string[]> { [""] = result.Errors.ToArray() }
                                : new Dictionary<string, string[]> { [""] = new[] { "Invalid request" } });

                        var vpd = new ValidationProblemDetails(errorsDict)
                        {
                            Title = "One or more validation errors occurred.",
                            Status = StatusCodes.Status400BadRequest
                        };

                        return ctrl.ValidationProblem(vpd);
                    }

                case ResultStatus.Error:
                default:
                    return ctrl.Problem(
                        title: "Bad request",
                        statusCode: StatusCodes.Status400BadRequest,
                        detail: string.Join("; ", result.Errors ?? Enumerable.Empty<string>()));
            }
        }
    }
}
