using Parser.Interfaces;

namespace Parser.Services.Plugins;

public class TraefikPlugin : IRouteProvider
{
    public int Priority => 0;

    public string? GetRoute(IReadOnlyDictionary<string, string> labels) => null;
}
