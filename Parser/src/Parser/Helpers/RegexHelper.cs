using System.Text.RegularExpressions;

namespace Parser.Helpers;

public class RegexHelper
{
    public static bool IsComposeFile(string fileName) =>
        Regex.IsMatch(fileName, @"compose.*\.ya?ml$", RegexOptions.IgnoreCase);
}