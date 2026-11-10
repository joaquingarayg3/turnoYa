using System.IdentityModel.Tokens.Jwt;
using System.Net;
using System.Security.Claims;
using System.Text;
using Microsoft.IdentityModel.Tokens;
using backend.Dtos.Auth;
using backend.Dtos.Usuario;
using backend.Mapping;
using backend.Models;
using backend.Utils.Respuestas;

namespace backend.Services;

public interface IAuthService
{
    public Task<LoginRespuestaDTO> Login(LoginDTO login);
}

public class AuthService : IAuthService
{
    private readonly string _secret;
    private readonly int _expiracionMinutos;
    private readonly UsuariosService _usuarioService;
    private readonly IEncoderService _encoder;

    public AuthService(IConfiguration config, UsuariosService usuarioService, IEncoderService encoder)
    {
        _secret = config.GetSection("JWT:Secret").Value ?? string.Empty;
        _expiracionMinutos = config.GetValue("JWT:ExpiracionMinutos", 120);
        _usuarioService = usuarioService;
        _encoder = encoder;
    }

    public async Task<LoginRespuestaDTO> Login(LoginDTO login)
    {
        Usuario? usuario = await _usuarioService.BuscarPorEmail(login.Email);

        // Mismo mensaje si no existe el email o si la clave es incorrecta,
        // asi no se revela que emails estan registrados
        if (usuario == null || !_encoder.Verify(login.Clave, usuario.Clave))
        {
            throw new RespuestaError("Credenciales invalidas", HttpStatusCode.BadRequest);
        }

        return new LoginRespuestaDTO()
        {
            Token = GenerarJwtToken(usuario),
            Usuario = usuario.ToUsuarioDTO()
        };
    }

    private string GenerarJwtToken(Usuario usuario)
    {
        var claims = new ClaimsIdentity();

        claims.AddClaim(new Claim("Id", usuario.Id.ToString()));
        claims.AddClaim(new Claim(ClaimTypes.NameIdentifier, usuario.Email));

        foreach (var rol in usuario.Roles)
        {
            claims.AddClaim(new Claim(ClaimTypes.Role, rol.Nombre));
        }

        byte[] bytes = Encoding.UTF8.GetBytes(_secret);
        var key = new SymmetricSecurityKey(bytes);

        var tokenDescriptor = new SecurityTokenDescriptor()
        {
            Subject = claims,
            Expires = DateTime.UtcNow.AddMinutes(_expiracionMinutos),
            SigningCredentials = new SigningCredentials(key, SecurityAlgorithms.HmacSha256Signature)
        };

        var tokenHandler = new JwtSecurityTokenHandler();
        var tokenConfig = tokenHandler.CreateToken(tokenDescriptor);
        return tokenHandler.WriteToken(tokenConfig);
    }
}
