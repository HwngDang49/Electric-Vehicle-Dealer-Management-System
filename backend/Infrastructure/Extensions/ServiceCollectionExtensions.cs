using System.Reflection;
using System.Security.Claims;
using System.Text.Json.Serialization;
using AutoMapper;
using backend.Api.Middlewares;
using backend.Common.Behaviors;
using backend.Feartures.Users.Login;
using backend.Infrastructure.Data;
using FluentValidation;
using MediatR;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;

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
            services.AddSwaggerGen(option =>
            {
                option.SwaggerDoc("v1", new OpenApiInfo
                {
                    Title = "EDVMS",
                    Version = "v1",
                    Description = "EDVMS API"
                }
        );
                var securityScheme = new OpenApiSecurityScheme
                {
                    Name = "Authorization",
                    Type = SecuritySchemeType.Http,
                    Scheme = "bearer",
                    BearerFormat = "JWT",
                    In = ParameterLocation.Header,
                    Description = "Please enter a token",
                    Reference = new OpenApiReference
                    {
                        Type = ReferenceType.SecurityScheme,
                        Id = "Bearer",
                    }
                };
                option.AddSecurityDefinition("Bearer", securityScheme);
                option.AddSecurityRequirement(new OpenApiSecurityRequirement
    {
        {securityScheme, new string[] { } }
    });
            });
            return services;
        }

        public static IServiceCollection AddMediatorBehaviors(this IServiceCollection services)
        {
            // Thứ tự chạy: Validation trước, rồi mới Transaction
            services.AddTransient(typeof(IPipelineBehavior<,>), typeof(ValidationBehavior<,>));
            services.AddTransient(typeof(IPipelineBehavior<,>), typeof(TransactionBehavior<,>));
            return services;
        }

        public static IServiceCollection TakeJwtSettings(this IServiceCollection services, IConfiguration config)
        {
            services.Configure<JwtSettingsRequest>(config.GetSection("JwtSettings"));

            return services;
        }
        public static IServiceCollection AddJwtAuthentication(this IServiceCollection services, IConfiguration config)
        {
            services.AddAuthentication(option =>
            {
                option.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
                option.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
            }).AddJwtBearer(JwtBearerDefaults.AuthenticationScheme, options =>
            {
                options.TokenValidationParameters = new TokenValidationParameters
                {
                    ValidateIssuer = true, // ai sẽ là người phát hành token
                    ValidateAudience = true, // ai sẽ sử dụng token này
                    ValidateLifetime = true, // thời gian tồn tại của token
                    ValidateIssuerSigningKey = true, // khóa bí mật để mã hóa token
                    ClockSkew = TimeSpan.FromSeconds(30), // thời gian chênh lệch cho phép khi kiểm tra thời gian hết hạn đang set cho chênh lệch 30 giây
                    ValidIssuer = config["JwtSettings:Issuer"],
                    ValidAudience = config["JwtSettings:Audience"],
                    IssuerSigningKey = new SymmetricSecurityKey(System.Text.Encoding.UTF8.GetBytes(config["JwtSettings:SecretKey"])),
                    RoleClaimType = ClaimTypes.Role
                };
            });
            return services;
        }
    }

    /// <summary>
    /// Nhóm extension cho Application pipeline (Middleware + Endpoints).
    /// Gọi trên app trong Program.cs
    /// </summary>
    public static class ApplicationBuilderExtensions
    {
        /// <summary>
        /// Cấu hình pipeline chuẩn:
        /// - Global Error Handling (ProblemDetails)
        /// - Swagger UI
        /// - Health Checks (/health)
        /// - Map Controllers
        /// </summary>
        public static WebApplication UseApiPipeline(this WebApplication app)
        {
            // 1) Global error handler — đặt sớm để bắt mọi lỗi
            app.UseMiddleware<ErrorHandlingMiddleware>();

            // 2) Swagger UI
            app.UseSwagger();
            app.UseSwaggerUI();

            // 3) (Nếu có CORS/Auth/Rate limit… thì chèn thêm ở đây)

            return app;
        }
    }
}
