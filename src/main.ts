import {
  countPossibleSecrets,
  createDigitValidator,
  generateSecret,
  submitGuess,
  type GameState,
} from './core.js';

type BaseOption = Readonly<{ value: number; label: string; name: string }>;
type RecordEntry = Readonly<{
  attempts: number;
  seconds: number;
  length: number;
  base: number;
  date: string;
}>;

const bases: readonly BaseOption[] = [
  { value: 2, label: 'bin', name: 'Двоичная' },
  { value: 8, label: 'oct', name: 'Восьмеричная' },
  { value: 10, label: 'dec', name: 'Десятичная' },
  { value: 16, label: 'hex', name: 'Шестнадцатеричная' },
];
const recordsKey = 'bulls-and-cows.records.v1';
const root = document.createElement('main');
root.className = 'app-shell';
root.setAttribute('aria-live', 'polite');
document.body.append(root);

const element = <K extends keyof HTMLElementTagNameMap>(
  tag: K,
  className?: string,
  text?: string,
): HTMLElementTagNameMap[K] => {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
};

const readRecords = (): RecordEntry[] => {
  try {
    const parsed: unknown = JSON.parse(
      localStorage.getItem(recordsKey) ?? '[]',
    );
    return Array.isArray(parsed) ? (parsed as RecordEntry[]) : [];
  } catch {
    return [];
  }
};

const saveRecord = (record: RecordEntry): RecordEntry[] => {
  const records = [...readRecords(), record]
    .sort(
      (first, second) =>
        first.attempts - second.attempts || first.seconds - second.seconds,
    )
    .slice(0, 10);
  localStorage.setItem(recordsKey, JSON.stringify(records));
  return records;
};

const formatTime = (totalSeconds: number): string => {
  const minutes = Math.floor(totalSeconds / 60)
    .toString()
    .padStart(2, '0');
  const seconds = (totalSeconds % 60).toString().padStart(2, '0');
  return `${minutes}:${seconds}`;
};

const renderRecords = (
  records: readonly RecordEntry[] = readRecords(),
): HTMLElement => {
  const section = element('section', 'records-panel');
  const heading = element('div', 'section-heading');
  heading.append(element('span', 'eyebrow', 'ЛИЧНЫЙ РЕЙТИНГ'));
  heading.append(element('h2', undefined, 'Лучшие результаты'));
  section.append(heading);

  if (records.length === 0) {
    section.append(
      element(
        'p',
        'empty-state',
        'Победите в первом раунде — результат появится здесь.',
      ),
    );
    return section;
  }

  const list = element('ol', 'record-list');
  records.forEach((record, index) => {
    const item = element('li', 'record-row');
    const rank = element(
      'span',
      'record-rank',
      `${(index + 1).toString().padStart(2, '0')}`,
    );
    const detail = element('span', 'record-detail');
    detail.append(element('strong', undefined, `${record.attempts} попыток`));
    detail.append(
      element(
        'small',
        undefined,
        `${record.length} цифр · ${bases.find((base) => base.value === record.base)?.label ?? record.base}`,
      ),
    );
    item.append(
      rank,
      detail,
      element('span', 'record-time', formatTime(record.seconds)),
    );
    list.append(item);
  });
  section.append(list);
  return section;
};

const renderSettings = (): void => {
  root.replaceChildren();
  const frame = element('div', 'settings-layout');
  const intro = element('section', 'intro-panel');
  intro.append(element('span', 'eyebrow', 'ЛОГИКА · НАБЛЮДЕНИЕ · ИНТУИЦИЯ'));
  intro.append(element('h1', undefined, 'Bulls & Cows'));
  intro.append(
    element(
      'p',
      'intro-copy',
      'Найдите секретную последовательность. Каждый точный знак — bull, каждый знак не на месте — cow.',
    ),
  );
  const example = element('div', 'example-card');
  example.append(element('span', 'example-label', 'ПРИМЕР ПОДСКАЗКИ'));
  example.append(element('p', undefined, '2 bulls  ·  1 cow'));
  example.append(
    element(
      'small',
      undefined,
      'Два символа стоят точно, ещё один — в другой позиции.',
    ),
  );
  intro.append(example);

  const form = element('form', 'setup-card');
  form.append(element('span', 'eyebrow', 'НОВЫЙ РАУНД'));
  form.append(element('h2', undefined, 'Настройте игру'));
  const baseLabel = element('label', 'field-label', 'Система счисления');
  baseLabel.htmlFor = 'base-select';
  const baseSelect = element('select', 'select-control');
  baseSelect.id = 'base-select';
  bases.forEach((base) => {
    const option = element('option', undefined, `${base.label} · ${base.name}`);
    option.value = String(base.value);
    baseSelect.append(option);
  });
  baseSelect.value = '10';
  baseLabel.append(baseSelect);

  const lengthLabel = element('label', 'field-label', 'Длина секрета');
  lengthLabel.htmlFor = 'length-select';
  const lengthSelect = element('select', 'select-control');
  lengthSelect.id = 'length-select';
  for (let length = 2; length <= 6; length += 1) {
    const option = element('option', undefined, `${length} цифры`);
    option.value = String(length);
    lengthSelect.append(option);
  }
  lengthSelect.value = '4';

  const possibleCount = element('p', 'possible-count');
  const updateOptions = (): void => {
    const base = Number(baseSelect.value);
    Array.from(lengthSelect.options).forEach((option) => {
      const disabled = Number(option.value) > base;
      option.disabled = disabled;
      if (disabled && option.selected) lengthSelect.value = '2';
    });
    possibleCount.textContent = `${countPossibleSecrets(Number(lengthSelect.value), base).toLocaleString('ru-RU')} возможных секретов`;
  };
  baseSelect.addEventListener('change', updateOptions);
  lengthSelect.addEventListener('change', updateOptions);
  updateOptions();

  const start = element('button', 'button button-primary', 'Начать игру');
  start.type = 'submit';
  form.append(baseLabel, lengthLabel, possibleCount, start);
  form.addEventListener('submit', (event) => {
    event.preventDefault();
    const base = Number(baseSelect.value);
    const length = Number(lengthSelect.value);
    renderGame(
      {
        length,
        base,
        secret: generateSecret(length, base),
        history: [],
        status: 'playing',
      },
      Date.now(),
    );
  });
  frame.append(intro, form);
  root.append(frame, renderRecords());
};

const renderGame = (initialState: GameState, startedAt: number): void => {
  let state = initialState;
  root.replaceChildren();
  const topbar = element('header', 'game-topbar');
  const brand = element('a', 'wordmark', 'B&C');
  brand.href = '#game';
  topbar.append(brand);
  const settings = element(
    'span',
    'game-settings',
    `${state.length} ЦИФР · ${bases.find((base) => base.value === state.base)?.label}`,
  );
  const newGame = element('button', 'button button-quiet', 'Новая игра');
  newGame.type = 'button';
  newGame.addEventListener('click', renderSettings);
  topbar.append(settings, newGame);

  const layout = element('div', 'game-layout');
  const gamePanel = element('section', 'game-panel');
  const header = element('div', 'game-heading');
  header.append(element('span', 'eyebrow', 'РАУНД В ПРОЦЕССЕ'));
  header.append(element('h1', undefined, 'Какой код загадал компьютер?'));
  header.append(
    element(
      'p',
      'intro-copy',
      `Введите ${state.length} разных символа. После каждой попытки вы получите подсказку.`,
    ),
  );
  gamePanel.append(header);

  const status = element('p', 'status-message');
  status.setAttribute('role', 'status');
  const form = element('form', 'guess-form');
  const inputLabel = element('label', 'field-label', 'Ваша попытка');
  inputLabel.htmlFor = 'guess-input';
  const inputRow = element('div', 'input-row');
  const input = element('input', 'guess-input');
  input.id = 'guess-input';
  input.name = 'guess';
  input.type = 'text';
  input.autocomplete = 'off';
  input.spellcheck = false;
  input.maxLength = state.length;
  input.placeholder = 'Введите код';
  input.setAttribute('aria-describedby', 'guess-help');
  const help = element(
    'small',
    'field-help',
    `Допустимые символы: ${state.base === 16 ? '0–9 и A–F' : `0–${(state.base - 1).toString(36)}`}`,
  );
  help.id = 'guess-help';
  const send = element('button', 'button button-primary', 'Проверить');
  send.type = 'submit';
  input.addEventListener('input', () => {
    const isValidDigit = createDigitValidator(state.base);
    const filtered = Array.from(input.value)
      .filter(isValidDigit)
      .slice(0, state.length)
      .join('');
    if (filtered !== input.value) input.value = filtered;
  });
  inputRow.append(input, send);
  inputLabel.append(inputRow, help);
  form.append(inputLabel);
  form.addEventListener('submit', (event) => {
    event.preventDefault();
    const guess = input.value;
    if (!guess) {
      status.textContent = 'Введите попытку перед проверкой.';
      return;
    }
    if (
      !state.history.some(
        (entry) => entry.guess.toLowerCase() === guess.toLowerCase(),
      ) &&
      state.status === 'playing'
    ) {
      const nextState = submitGuess(state, guess);
      if (nextState === state) {
        status.textContent = `Нужно ввести ${state.length} уникальных допустимых цифр.`;
        return;
      }
      state = nextState;
      const won = state.status === 'won';
      status.textContent = won
        ? 'Секрет раскрыт. Отличная работа!'
        : 'Попытка добавлена. Подумайте над подсказкой.';
      if (won) {
        const seconds = Math.max(
          0,
          Math.floor((Date.now() - startedAt) / 1000),
        );
        saveRecord({
          attempts: state.history.length,
          seconds,
          length: state.length,
          base: state.base,
          date: new Date().toISOString(),
        });
      }
    } else if (state.status === 'won') {
      status.textContent = 'Раунд уже завершён. Начните новую игру.';
    } else {
      status.textContent = 'Эта попытка уже есть в истории.';
      input.focus();
      return;
    }
    renderHistory(state);
    if (state.status === 'won') {
      send.disabled = true;
      input.disabled = true;
      gamePanel.append(renderRecords());
    }
    input.value = '';
    input.focus();
  });
  form.append(status);
  gamePanel.append(form);

  const history = element('section', 'history-panel');
  history.append(element('div', 'section-heading', 'ИСТОРИЯ ПОПЫТОК'));
  const historyList = element('ol', 'history-list');
  history.append(historyList);
  const historyEmpty = element(
    'p',
    'empty-state',
    'Ваши попытки появятся здесь.',
  );
  history.append(historyEmpty);

  const renderHistory = (gameState: GameState): void => {
    historyList.replaceChildren();
    historyEmpty.hidden = gameState.history.length > 0;
    gameState.history.forEach((entry, index) => {
      const item = element('li', 'history-row');
      item.append(
        element('span', 'history-index', String(index + 1).padStart(2, '0')),
      );
      const code = element('span', 'guess-code');
      Array.from(entry.guess.toUpperCase()).forEach((digit) =>
        code.append(element('span', 'digit-tile', digit)),
      );
      const score = element('span', 'score-pills');
      score.append(element('span', 'score-pill bulls', `${entry.bulls} bulls`));
      score.append(element('span', 'score-pill cows', `${entry.cows} cows`));
      item.append(code, score);
      historyList.append(item);
    });
  };
  layout.append(gamePanel, history);
  root.append(topbar, layout);
  input.focus();
};

renderSettings();
