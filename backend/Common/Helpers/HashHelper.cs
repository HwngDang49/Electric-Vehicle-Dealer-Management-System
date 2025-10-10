using System.Text;

namespace backend.Common.Helpers
{
    public class HashHelper
    {
        // hash để lưu vào database

        public static string BCriptHash(string input)
        {
            return BCrypt.Net.BCrypt.HashPassword(input);
        }

        // verify để đăng nhập
        public static bool BCriptVerify(string input, string hash)
        {
            return BCrypt.Net.BCrypt.Verify(input, hash);
        }

        //tạo chuỗi ngẫu nhiên
        public static string GenerateRandomString(int lenght)
        {
            StringBuilder s = new StringBuilder();
            var random = new Random();
            for (int i = 0; i < lenght; i++)
            {
                s.Append((char)random.Next('a', 'z'));
            };
            return s.ToString();
        }

    }
}
