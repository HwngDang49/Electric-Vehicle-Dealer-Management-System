using System.Reflection;
using backend.Infrastructure.Data;
using FluentValidation;
using Microsoft.EntityFrameworkCore;

namespace backend
{
    public class Program
    {
        public static void Main(string[] args)
        {
            var builder = WebApplication.CreateBuilder(args);

            // Add services to the container.

            builder.Services.AddControllers();
            builder.Services.AddEndpointsApiExplorer();
            builder.Services.AddSwaggerGen();

            // EF Database First
            builder.Services.AddDbContext<EVDmsDbContext>(options =>
                options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection")));


            // MediatR + Validators + AutoMapper
            builder.Services.AddMediatR(cfg =>
                cfg.RegisterServicesFromAssembly(Assembly.GetExecutingAssembly()));
            //Assembly.GetExecutingAssembly() quét toàn bộ các Handler, Command, Request… trong project hiện tại.
            //cfg.RegisterServicesFromAssembly(...) là cú pháp mới của MediatR 12 để đăng ký handler.
            builder.Services.AddValidatorsFromAssemblyContaining<Program>();
            builder.Services.AddAutoMapper(typeof(Program));

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
