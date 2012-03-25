define(
    ["./common", "./app", "./event", "./event.keyboard",
     "./graphics", "./graphics.sprite", "./clock", "./context"],
    function(jsglet, app, event, keyboard, graphics, sprite,
             clock, context){
        jsglet.event = event;
        jsglet.event.keyboard = keyboard;
        jsglet.app = app;
        jsglet.graphics = graphics;
        jsglet.graphics.sprite = sprite;
        jsglet.context = context;
        jsglet.clock = clock;
        console.log(jsglet);
        return jsglet;
    });
