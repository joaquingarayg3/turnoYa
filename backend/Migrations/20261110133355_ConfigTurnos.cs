using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace backend.Migrations
{
    /// <inheritdoc />
    public partial class ConfigTurnos : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "DiasMaxAnticipacion",
                table: "Negocios",
                type: "int",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "HorasToleranciaCancelacion",
                table: "Negocios",
                type: "int",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "IntervaloTurnosMinutos",
                table: "Negocios",
                type: "int",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "DiasMaxAnticipacion",
                table: "Negocios");

            migrationBuilder.DropColumn(
                name: "HorasToleranciaCancelacion",
                table: "Negocios");

            migrationBuilder.DropColumn(
                name: "IntervaloTurnosMinutos",
                table: "Negocios");
        }
    }
}
