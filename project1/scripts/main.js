// --- Регистрируем настройку ---
Hooks.once("init", () => {
  game.settings.register("my-module", "enableCover", {
    name: "Включить автоматическое укрытие",
    hint: "Добавляет бонус к AC от укрытия при дальних атаках",
    scope: "world",
    config: true,
    default: true,
    type: Boolean
  });
});

// --- Добавляем переключатель в HUD токена ---
Hooks.on("renderTokenHUD", (hud, html, data) => {
  if (!game.user.isGM) return;

  const icon = $(`<div class="control-icon" title="Укрытие активировано">
    <i class="fas fa-shield-alt"></i>
  </div>`);

  if (canvas.tokens.get(data._id)?.document.getFlag("my-module", "coverDisabled")) {
    icon.addClass("inactive");
  }

  icon.click(async () => {
    const token = canvas.tokens.get(data._id);
    const current = token.document.getFlag("my-module", "coverDisabled");
    await token.document.setFlag("my-module", "coverDisabled", !current);
    icon.toggleClass("inactive");
  });

  html.find(".col.right").append(icon);
});

// --- Основной хук атаки ---
Hooks.on("midi-qol.preAttackRollComplete", async (workflow) => {
  if (!game.settings.get("my-module", "enableCover")) return;

  const attacker = workflow.actorToken;
  const target = workflow.targets.first();
  if (!attacker || !target) return;

  // Если вручную отключено у цели
  if (target.document.getFlag("my-module", "coverDisabled")) return;

  const coverBonus = calculateCover(attacker, target);
  if (coverBonus === 0) return;

  const effect = {
    label: `Укрытие +${coverBonus}`,
    icon: "icons/svg/shield.svg",
    origin: workflow.item.uuid,
    changes: [
      {
        key: "data.attributes.ac.value",
        mode: CONST.ACTIVE_EFFECT_MODES.ADD,
        value: coverBonus
      }
    ],
    disabled: false,
    duration: {
      rounds: 1,
      startRound: game.combat?.round,
      startTime: game.time.worldTime
    },
    flags: {
      "my-module": { coverApplied: true }
    }
  };

  await MidiQOL.socket().executeAsGM("createEffects", {
    actorUuid: target.actor.uuid,
    effects: [effect]
  });

  ui.notifications.info(`Цель получила укрытие: +${coverBonus} к AC`);
});

// --- Расчёт укрытия ---
function calculateCover(attacker, target) {
  const points = [
    target.center,
    { x: target.bounds.left, y: target.bounds.top },
    { x: target.bounds.right, y: target.bounds.top },
    { x: target.bounds.left, y: target.bounds.bottom },
    { x: target.bounds.right, y: target.bounds.bottom }
  ];

  let blocked = 0;
  for (const pt of points) {
    const ray = new Ray(attacker.center, pt);
    if (
      canvas.walls.checkCollision(ray.A, ray.B, { type: "sight" }) ||
      isObstructedByToken(ray, attacker, target)
    ) {
      blocked++;
    }
  }

  if (blocked >= 4) return 5;
  if (blocked >= 2) return 2;
  return 0;
}

function isObstructedByToken(ray, attacker, target) {
  return canvas.tokens.placeables.some((token) => {
    if (token === attacker || token === target) return false;
    return ray.intersectsRectangle(token.bounds);
  });
}
