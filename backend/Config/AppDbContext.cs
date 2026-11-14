using Microsoft.EntityFrameworkCore;
using backend.Models;

namespace backend.Config;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

    public DbSet<Usuario> Usuarios { get; set; }
    public DbSet<Rol> Roles { get; set; }
    public DbSet<Negocio> Negocios { get; set; }
    public DbSet<Servicio> Servicios { get; set; }
    public DbSet<HorarioAtencion> HorariosAtencion { get; set; }
    public DbSet<Turno> Turnos { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        // ---------- Usuario / Rol (N:M) ----------
        modelBuilder.Entity<Usuario>().HasIndex(u => u.Email).IsUnique();
        modelBuilder.Entity<Rol>().HasIndex(r => r.Nombre).IsUnique();

        modelBuilder.Entity<Usuario>()
            .HasMany(u => u.Roles).WithMany()
            .UsingEntity<UsuarioRol>(
                r => r.HasOne<Rol>().WithMany().HasForeignKey(e => e.RolId),
                l => l.HasOne<Usuario>().WithMany().HasForeignKey(e => e.UsuarioId),
                j => j.HasKey(e => new { e.UsuarioId, e.RolId })
            );

        // ---------- Negocio ----------
        modelBuilder.Entity<Negocio>()
            .HasOne(n => n.Usuario)
            .WithMany(u => u.Negocios)
            .HasForeignKey(n => n.UsuarioId)
            .OnDelete(DeleteBehavior.Cascade);

        // ---------- Servicio ----------
        modelBuilder.Entity<Servicio>()
            .HasOne(s => s.Negocio)
            .WithMany(n => n.Servicios)
            .HasForeignKey(s => s.NegocioId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<Servicio>()
            .Property(s => s.Precio)
            .HasPrecision(10, 2);

        // ---------- HorarioAtencion ----------
        modelBuilder.Entity<HorarioAtencion>()
            .HasOne(h => h.Negocio)
            .WithMany(n => n.Horarios)
            .HasForeignKey(h => h.NegocioId)
            .OnDelete(DeleteBehavior.Cascade);

        // ---------- Turno ----------
        // Restrict: SQL Server no permite dos caminos de borrado en cascada
        // (Usuario -> Turno y Usuario -> Negocio -> Servicio -> Turno),
        // y ademas no queremos perder el historial de turnos.
        modelBuilder.Entity<Turno>()
            .HasOne(t => t.Cliente)
            .WithMany(u => u.Turnos)
            .HasForeignKey(t => t.ClienteId)
            .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<Turno>()
            .HasOne(t => t.Servicio)
            .WithMany(s => s.Turnos)
            .HasForeignKey(t => t.ServicioId)
            .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<Turno>()
            .Property(t => t.Estado)
            .HasConversion<string>()
            .HasMaxLength(20);

        // Acelera la busqueda de superposicion de turnos
        modelBuilder.Entity<Turno>()
            .HasIndex(t => new { t.ServicioId, t.FechaHoraInicio });

        // ---------- Seed ----------
        modelBuilder.Entity<Rol>().HasData(
            new Rol() { Id = 1, Nombre = "Admin" },
            new Rol() { Id = 2, Nombre = "User" }
        );

        // Admin inicial. Clave: Admin1234 (guardada con BCrypt; cambiarla en produccion)
        // Se usa un objeto anonimo para no cargar las listas de navegacion en el seed
        modelBuilder.Entity<Usuario>().HasData(
            new
            {
                Id = 1,
                Nombre = "Admin",
                Apellido = "TurnoYa",
                Email = "admin@turnoya.com",
                Clave = "$2a$13$zv/0tBtb8HX9yrkYHVQFt.FxUSRgs7QGLTGRdIFb.uJpPc5v8j7FC",
                FechaRegistro = new DateTime(2026, 1, 1, 0, 0, 0, DateTimeKind.Utc)
            }
        );

        modelBuilder.Entity<UsuarioRol>().HasData(
            new UsuarioRol() { UsuarioId = 1, RolId = 1 },
            new UsuarioRol() { UsuarioId = 1, RolId = 2 }
        );
    }
}
