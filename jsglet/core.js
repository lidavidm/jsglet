define(
    ["./common", "./app", "./event", "./event.keyboard", "./image",
     "./graphics", "./graphics.sprite", "./clock", "./context"],
    function(jsglet, app, event, keyboard, image, graphics, sprite,
             clock, context){
        jsglet.event = event;
        jsglet.event.keyboard = keyboard;
        jsglet.app = app;
        jsglet.image = image;
        jsglet.graphics = graphics;
        jsglet.graphics.sprite = sprite;
        jsglet.context = context;
        jsglet.clock = clock;
        console.log(jsglet);
        return jsglet;
    });
