using Parser.Helpers;

var servicesDirectory = Path.GetFullPath(Path.Combine(AppContext.BaseDirectory, "../../../../../../Services"));

var composeFiles = Directory.EnumerateFiles(servicesDirectory, "*", SearchOption.AllDirectories)
    .Where(file => RegexHelper.IsComposeFile(Path.GetFileName(file)));