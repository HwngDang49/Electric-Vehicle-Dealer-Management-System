using System.Reflection;
using System.Security.Claims;
using System.Text.Json.Serialization;
using AutoMapper;
using backend.Api.Middlewares;
using backend.Common.Behaviors;
using backend.Feartures.Customers.Create;
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
            services.AddHttpContextAccessor();

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

            services.AddCors(opt =>
            {
                opt.AddPolicy("FE", p => p
                    .WithOrigins("http://localhost:5173") // đổi theo FE của bạn
                    .AllowAnyHeader()
                    .AllowAnyMethod()
                    .AllowCredentials());
            });

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
            // 5) JWT & Authorization(NHÚNG NGAY Ở ĐÂY)
            services.Configure<JwtSettingsRequest>(config.GetSection("JwtSettings"));

            var secret = config["JwtSettings:SecretKey"];
            if (string.IsNullOrWhiteSpace(secret))
                throw new InvalidOperationException("JwtSettings:SecretKey is missing or empty.");

            services
                .AddAuthentication(options =>
                {
                    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
                    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
                })
                .AddJwtBearer(JwtBearerDefaults.AuthenticationScheme, options =>
                {
                    options.TokenValidationParameters = new TokenValidationParameters
                    {
                        ValidateIssuer = true,
                        ValidIssuer = config["JwtSettings:Issuer"],

                        ValidateAudience = true,
                        ValidAudience = config["JwtSettings:Audience"],

                        ValidateLifetime = true,
                        ClockSkew = TimeSpan.Zero, // tránh lệch giờ

                        ValidateIssuerSigningKey = true,
                        IssuerSigningKey = new SymmetricSecurityKey(System.Text.Encoding.UTF8.GetBytes(secret)),

                        RoleClaimType = ClaimTypes.Role,
                        NameClaimType = ClaimTypes.NameIdentifier
                    };
                });

            services.AddAuthorization();

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
            app.UseCors("FE");
            app.UseAuthentication();
            app.UseAuthorization();
            app.MapControllers();

            return app;
        }
    }
}