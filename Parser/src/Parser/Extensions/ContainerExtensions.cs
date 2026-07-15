using System.Text.RegularExpressions;
using Parser.Entities;

namespace Parser.Extensions;

public static class ContainerExtensions
{
    public static void SearchRoute(this Container container, Dictionary<string, string> labels)
    {
        var regex = new Regex(@"^traefik\.http\.routers\.[^.]+\.rule$");

        var route = labels
            .Where(label => regex.IsMatch(label.Key))
            .Select(label => label.Value)
            .FirstOrDefault();
        
        if (route is null)
            return;
        
        var domainMatch = Regex.Match(route, @"`([^`]+)`");
        
        if (!domainMatch.Success)
            return;
        
        container.Route = domainMatch.Groups[1].Value;
    }
}