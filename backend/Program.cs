using System.Text;
using System.Text.Json.Serialization;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;
using backend.Config;
using backend.Models;
using backend.Repositories;
using backend.Services;
using backend.Utils.Filters;

var builder = WebApplication.CreateBuilder(args);

// Controllers + JSON: enums como texto y sin ciclos de navegacion
builder.Services.AddControllers().AddJsonOptions(opt =>
{
    opt.JsonSerializerOptions.Converters.Add(new JsonStringEnumConverter());
    opt.JsonSerializerOptions.ReferenceHandler = ReferenceHandler.IgnoreCycles;
});

// Swagger con boton "Authorize" para el token JWT
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new() { Title = "TurnoYa API", Version = "v1" });

    c.AddSecurityDefinition("token", new OpenApiSecurityScheme
    {
        Type = SecuritySchemeType.Http,
        Scheme = "bearer",
        BearerFormat = "JWT",
        In = ParameterLocation.Header,
        Name = "Authorization",
        Description = "Token JWT"
    });

    c.OperationFilter<AuthOperationFilter>();
});

// Auth (JWT)
string secret = builder.Configuration.GetSection("JWT:Secret").Value ?? string.Empty;

builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.SaveToken = true;
        var key = Encoding.UTF8.GetBytes(secret);
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuerSigningKey = true,
            IssuerSigningKey = new SymmetricSecurityKey(key),
            ValidateIssuer = false,
            ValidateAudience = false,
            ValidateLifetime = true
        };
    });

// CORS: el front de Vite corre en otro puerto
builder.Services.AddCors(opt =>
{
    opt.AddPolicy("front", p => p
        .WithOrigins("http://localhost:5173")
        .AllowAnyHeader()
        .AllowAnyMethod());
});

// Services
builder.Services.AddScoped<IEncoderService, EncoderService>();
builder.Services.AddScoped<IAuthService, AuthService>();
builder.Services.AddScoped<RolesService>();
builder.Services.AddScoped<UsuariosService>();
// Track A
builder.Services.AddScoped<NegociosService>();
// Track B
builder.Services.AddScoped<ServiciosService>();
// Track C
builder.Services.AddScoped<TurnosService>();
// Track D
builder.Services.AddScoped<CatalogoService>();

// Repositories
builder.Services.AddScoped<IRepository<Usuario>, Repository<Usuario>>();
builder.Services.AddScoped<IRepository<Rol>, Repository<Rol>>();
builder.Services.AddScoped<IRepository<Negocio>, Repository<Negocio>>();
builder.Services.AddScoped<IRepository<Servicio>, Repository<Servicio>>();
builder.Services.AddScoped<IRepository<HorarioAtencion>, Repository<HorarioAtencion>>();
builder.Services.AddScoped<IRepository<Turno>, Repository<Turno>>();

// DB
builder.Services.AddDbContext<AppDbContext>(options =>
{
    string conn = builder.Configuration.GetConnectionString("dbDev") ?? string.Empty;
    options.UseSqlServer(conn);
});

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseCors("front");

app.UseHttpsRedirection();

app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

app.Run();
