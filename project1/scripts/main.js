// ������������� ������
Hooks.on("ready", () => {
    if (!game.user.isGM) return; // ������ ��� GM
    console.log("������ Hello World ��������!");

    // ����������� ���� ������� � ����
    ChatMessage.create({
        content: "<b>������!</b> ������ <i>Hello World</i> ������� �����������!",
        whisper: ChatMessage.getWhisperRecipients("GM") // ������ ����
    });
});
