using System.Reflection;
using System.Text.Json.Serialization;
using AutoMapper;
using backend.Api.Middlewares;
using backend.Common.Behaviors;
using backend.Feartures.Customers.Create;
using backend.Infrastructure.Data;
using FluentValidation;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace backend.Infrastructure.Extensions
{
    public static class ServiceCollectionExtensions
    {
        /// <summary>
        /// Đăng ký tất cả các dịch vụ cần thiết cho ứng dụng.
        /// </summary>
        /// <param name="apiAssembly">Assembly của project API chính, dùng để quét các feature.</param>
        public static IServiceCollection AddCoreServices(
            this IServiceCollection services,
            IConfiguration config,
            Assembly apiAssembly)
        {
            // 1. Dịch vụ API cơ bản
            services.AddControllers()
                .AddJsonOptions(options =>
                    options.JsonSerializerOptions.Converters.Add(new JsonStringEnumConverter()));

            services.AddEndpointsApiExplorer();
            services.AddSwaggerGen();

            // 2. Dịch vụ Database
            var connectionString = config.GetConnectionString("DefaultConnection");
            services.AddDbContext<EVDmsDbContext>(options =>
                options.UseSqlServer(connectionString));

            // 3. Dịch vụ Application (quét đúng assembly)
            services.AddMediatR(cfg => cfg.RegisterServicesFromAssembly(apiAssembly));
            services.AddSingleton<IMapper>(_ =>
            {
                var cfg = new MapperConfiguration(c => c.AddMaps(Assembly.GetExecutingAssembly()));
                return cfg.CreateMapper();
            });
            services.AddValidatorsFromAssembly(apiAssembly);

            // 4. Đăng ký các Pipeline Behavior của MediatR (QUAN TRỌNG)
            services.AddTransient(typeof(IPipelineBehavior<,>), typeof(ValidationBehavior<,>));
            services.AddTransient(typeof(IPipelineBehavior<,>), typeof(TransactionBehavior<,>));

            services.AddScoped<CreateCustomerRuleChecker>();
            return services;
        }

        /// <summary>
        /// Cấu hình HTTP request pipeline chuẩn cho API.
        /// </summary>
        public static WebApplication UseApiPipeline(this WebApplication app)
        {
            // Global error handler phải được đặt ở đầu
            app.UseMiddleware<ErrorHandlingMiddleware>();

            if (app.Environment.IsDevelopment())
            {
                app.UseSwagger();
                app.UseSwaggerUI();
            }

            app.UseHttpsRedirection();
            app.UseAuthorization();
            app.MapControllers();

            return app;
        }
    }
}