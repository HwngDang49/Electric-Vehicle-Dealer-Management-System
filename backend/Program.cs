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
                .AddSwagger(builder.Configuration);
            var app = builder.Build();

            if (app.Environment.IsDevelopment())
            {
                app.UseSwagger();
                app.UseSwaggerUI();
            }

            // Configure the HTTP request pipeline.

            app.UseHttpsRedirection();

            app.UseAuthorization();

            app.MapControllers();

            app.Run();
        }
    }
}
