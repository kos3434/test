// Инициализация модуля
Hooks.once("init", () => {
    console.log("My Simple Module: Initialized!");
});

// Добавление кнопки в панель управления сценой
Hooks.on("getSceneControlButtons", (controls) => {
    controls.push({
        name: "myModule",
        title: "My Module",
        icon: "fas fa-smile",
        layer: "myLayer",
        tools: [
            {
                name: "showPopup",
                title: "Show Popup",
                icon: "fas fa-comment",
                onClick: () => showPopup(),
                button: true
            }
        ]
    });
});

// Показать всплывающее окно
function showPopup() {
    const html = renderTemplate("modules/my-simple-module/templates/popup.html");
    new Dialog({
        title: "Hello World!",
        content: html,
        buttons: {
            ok: {
                icon: '<i class="fas fa-check"></i>',
                label: "OK",
                callback: () => console.log("Popup closed")
            }
        }
    }).render(true);
}