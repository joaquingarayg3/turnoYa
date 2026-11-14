namespace backend.Services;
using BCrypt.Net;

public interface IEncoderService
{
    string Encode(string toHash);
    bool Verify(string str, string hash);
}

public class EncoderService : IEncoderService
{
    public string Encode(string toHash)
    {
        string salt = BCrypt.GenerateSalt(13);
        return BCrypt.HashPassword(toHash, salt);
    }

    public bool Verify(string str, string hash)
    {
        return BCrypt.Verify(str, hash);
    }
}
