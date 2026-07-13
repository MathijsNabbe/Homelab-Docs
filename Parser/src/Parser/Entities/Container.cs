namespace Parser.Entities;

public class Container
{
    public required string Name { get; set; }

    public List<string> Ports { get; } = new();
}