using Parser.Helpers;

var repoRoot = Path.GetFullPath(Path.Combine(AppContext.BaseDirectory, "../../../.."));
var servicesDirectory = Path.Combine(repoRoot, "Services");

var composeFiles = Directory.EnumerateFiles(servicesDirectory, "*", SearchOption.AllDirectories)
    .Where(file => RegexHelper.IsComposeFile(Path.GetFileName(file)));