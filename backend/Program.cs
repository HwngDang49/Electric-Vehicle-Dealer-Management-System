using backend.Infrastructure.Extensions;
namespace backend
{
    public class Program
    {
        public static void Main(string[] args)
        {
            var builder = WebApplication.CreateBuilder(args);

            // Add services to the container.
            builder.Services
                .AddApiControllers()
                .AddDatabase(builder.Configuration)
                .AddMediatorHandlers()
                .AddAutoMapperProfiles()
                .AddValidation()
                .AddSwagger(builder.Configuration)
                .TakeJwtSettings(builder.Configuration)
                .AddJwtAuthentication(builder.Configuration);

            var app = builder.Build();

            app.UseApiPipeline();

            // Configure the HTTP request pipeline.

            app.UseHttpsRedirection();

            app.UseAuthentication();

            app.UseAuthorization();

            app.MapControllers();

            app.Run();
        }
    }
}
