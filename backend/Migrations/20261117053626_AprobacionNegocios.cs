using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace backend.Migrations
{
    /// <inheritdoc />
    public partial class AprobacionNegocios : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "EstadoAprobacion",
                table: "Negocios",
                type: "nvarchar(20)",
                maxLength: 20,
                nullable: false,
                defaultValue: "Aprobado");

            migrationBuilder.AddColumn<string>(
                name: "MotivoRechazo",
                table: "Negocios",
                type: "nvarchar(300)",
                maxLength: 300,
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "EstadoAprobacion",
                table: "Negocios");

            migrationBuilder.DropColumn(
                name: "MotivoRechazo",
                table: "Negocios");
        }
    }
}
