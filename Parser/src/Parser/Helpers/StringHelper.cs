namespace Parser.Helpers;

public static class StringHelper
{
    public static string ValueOrUnknown(string? input) => 
        string.IsNullOrWhiteSpace(input)
        ? "Unknown"
        : input;
}