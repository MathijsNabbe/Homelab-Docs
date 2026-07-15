using Parser.Entities;

namespace Parser.Extensions;

public static class ServiceExtensions
{
    public static void SearchIconUrl(this Service service, Dictionary<string, string> labels)
    {
        var reference = "homepage.icon";

        if (labels.ContainsKey(reference) == false)
            return;
        
        var iconName = labels[reference];
        var iconType = Path.GetExtension(iconName).Substring(1);
        service.IconUrl = $"https://cdn.jsdelivr.net/gh/homarr-labs/dashboard-icons/{iconType}/{iconName}";
    }
}