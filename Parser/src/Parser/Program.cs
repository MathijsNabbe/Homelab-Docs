using Microsoft.Extensions.DependencyInjection;
using Parser.Extensions;
using Parser.Services;

var services = new ServiceCollection()
    .AddPlugins();

services.BuildServiceProvider();

new Mapper().Run();
