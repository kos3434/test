// Инициализация модуля
Hooks.on("ready", () => {
    if (!game.user.isGM) return; // Только для GM
    console.log("Модуль Hello World загружен!");

    // Приветствие всем игрокам в чате
    ChatMessage.create({
        content: "<b>Привет!</b> Модуль <i>Hello World</i> успешно активирован!",
        whisper: ChatMessage.getWhisperRecipients("GM") // Только ГМам
    });
});
