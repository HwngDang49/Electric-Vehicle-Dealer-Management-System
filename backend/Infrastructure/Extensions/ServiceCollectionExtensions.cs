using System.Reflection;
using System.Text.Json.Serialization;
using AutoMapper;
using backend.Infrastructure.Data;
using FluentValidation;
using Microsoft.EntityFrameworkCore;

namespace backend.Infrastructure.Extensions
{
    public static class ServiceCollectionExtensions
    {
        /// <summary>
        /// Đăng ký toàn bộ dịch vụ “nền” cho API.
        /// - Controllers (enum stringify)
        /// - DbContext (SqlServer) đọc từ ConnectionStrings:DefaultConnection
        /// - MediatR v12+ (scan handlers trong assembly API)
        /// - AutoMapper (đăng ký thủ công) quét Profiles trong assembly API
        /// - FluentValidation (quét validators)
        /// - Swagger + HealthChecks (SQL)
        /// </summary>
        public static IServiceCollection AddApiControllers(this IServiceCollection services)
        {
            services.AddControllers()
                .AddJsonOptions(o => o.JsonSerializerOptions.Converters.Add(new JsonStringEnumConverter()));
            return services;
        }

        public static IServiceCollection AddDatabase(this IServiceCollection services, IConfiguration config)
        {
            var cs = config.GetConnectionString("DefaultConnection");
            services.AddDbContext<EVDmsDbContext>(opt => opt.UseSqlServer(cs));
            return services;
        }

        public static IServiceCollection AddMediatorHandlers(this IServiceCollection services)
        {
            services.AddMediatR(cfg => cfg.RegisterServicesFromAssembly(Assembly.GetExecutingAssembly()));
            return services;
        }

        public static IServiceCollection AddAutoMapperProfiles(this IServiceCollection services)
        {
            services.AddSingleton<IMapper>(_ =>
            {
                var cfg = new MapperConfiguration(c => c.AddMaps(Assembly.GetExecutingAssembly()));
                return cfg.CreateMapper();
            });
            return services;
        }

        public static IServiceCollection AddValidation(this IServiceCollection services)
        {
            services.AddValidatorsFromAssembly(Assembly.GetExecutingAssembly());
            return services;
        }

        public static IServiceCollection AddSwagger(this IServiceCollection services, IConfiguration config)
        {
            services.AddEndpointsApiExplorer();
            services.AddSwaggerGen();
            return services;
        }
    }
}
