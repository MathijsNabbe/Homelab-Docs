using Parser.Interfaces;

namespace Parser.Services.Plugins;

public class HomepagePlugin : IIconProvider
{
    public int Priority => 0;

    public string? GetIcon(IReadOnlyDictionary<string, string> labels) => null;
}
