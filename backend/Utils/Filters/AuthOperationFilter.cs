using Microsoft.AspNetCore.Authorization;
using Microsoft.OpenApi.Models;
using Swashbuckle.AspNetCore.SwaggerGen;

namespace backend.Utils.Filters;

// Muestra el candado en Swagger solo en los endpoints con [Authorize]
public class AuthOperationFilter : IOperationFilter
{
    public void Apply(OpenApiOperation operation, OperationFilterContext context)
    {
        var atributos = context.ApiDescription.CustomAttributes();

        var isAuthorize = atributos.Any(attr => attr.GetType() == typeof(AuthorizeAttribute));
        var isAllowAnonymous = atributos.Any(attr => attr.GetType() == typeof(AllowAnonymousAttribute));

        if (!isAuthorize || isAllowAnonymous) return;

        operation.Security = new List<OpenApiSecurityRequirement>
        {
            new OpenApiSecurityRequirement
            {
                {
                    new OpenApiSecurityScheme
                    {
                        Reference = new OpenApiReference
                        {
                            Type = ReferenceType.SecurityScheme,
                            Id = "token"
                        }
                    },
                    Array.Empty<string>()
                }
            }
        };
    }
}
