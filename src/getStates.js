import {minimazeRows, minimazeColumns} from "./minimaze";


export default function getStates(initialState) {
  // Ініціалізуємо результуючий масив початковим станом
  const result = [initialState]

  // Копіюємо початковий стан
  let state = JSON.parse(JSON.stringify(initialState));
  // У цього стану відіймаємо мінімальний елемент рядку у кожному рядку
  minimazeRows(state.c);
  // Додаємо цей стан до результуючого масиву
  result.push(state);

  // Аналогічно зі стовпцями
  state = JSON.parse(JSON.stringify(state));
  minimazeColumns(state.c);
  result.push(state);
  
  // Ініціалізуємо змінні поточкного стану і змінну
  // що відповідає за те, кінцевий він чи ні
  let next = state, isFinal = false;

  // Входимо до нескінченного циклу
  while(true) {
    // Отримуємо змінні, описуючі наступний стан
    [next, isFinal] = nextState(next);

    // Додаємо його до массиву
    result.push(next);

    // Якщо стан фінальний - виходимо із циклу
    if(isFinal) break;
  }

  // Повертаємо масив
  return result;
}

// Створюємо функцію, що отримує поточний стан і повертає наступний
function nextState(prevState) {
  
  // Створюємо копію поточного стану
  const state = JSON.parse(JSON.stringify(prevState));

  // Ітеруємося по усім клітинкам і, за наявності, замінюємо null на 0
  // Це зроблено тому, що через значення null ми позначуємо закреснелі нулі
  // На цьому етапі ми знімаємо закреслення попереднього етапу
  // Щоб потім закреслити нулі на даному
  for (let i = 0; i < state.c.length; ++i) 
    for (let j = 0; j < state.c[i].length; ++j)
      if (state.c[i][j] === null)
        state.c[i][j] = 0;

  // Також знімаємо виділення з усіх стовпців і рядків
  state.markedRows = [false, false, false];
  state.markedColumns = [false, false, false];

  // Створюємо масив, у якому елемент відповідє парі значень:
  // Номеру рядку і кількості нулів у цьому рядку
  const numberOfZeros = state.c.map( (row, i) => 
    ({
      // Номер рядку
      i: i,

      // Кількість нулів у цьому рядку, котру рахуємо методом масиву reduce
      zeros: row.reduce((res, val) => val === 0 ? res + 1 : res, 0)
    })
    // Сортуємо цей масив за кількістю нулів у рядку
  ).sort((a, b) => a.zeros - b.zeros);

  // Ініціалізуємо змінну, у котріх зберігаємо поточну кількість виділених нулів
  // У нашій реалізації це просто нулі у масиві
  // Бо невиділені нулі позначені через null
  let numberOfDottedZeros = 0;

  // Ітеруємося по цьому масиву
  for(let rowTurn of numberOfZeros) {
    // Отримуємо номер рядку
    const i = rowTurn.i;

    // Ітеруємося по стовпцям
    for(let j = 0; j < state.c[i].length; ++j) {

      // Якщо ми зустрічаємо нуль, то додаємо його до кількості виділених нулів
      if(state.c[i][j] === 0) {
        numberOfDottedZeros++;

        // Усі інші нулі у цьому рядку закреслюємо, тобто позначаємо null
        for(let k = j+1; k < state.c[i].length; ++k) {
          if(state.c[i][k] === 0)
            state.c[i][k] = null;
        }

        // Аналогічно з усіми нулями у цьому стовпці
        for(let k = i+1; k < state.c.length; ++k) {
          if(state.c[k][j] === 0)
            state.c[k][j] = null;
        }

        // Виходимо з циклу, бо більше у цьому стовпці ми не знайдемо виділених нулів
        break;
      }
    }
  }

  // Якщо кількість виділених нулів дорівнює кількості рядків
  // То маємо оптимальний розподіл
  if(numberOfDottedZeros === state.c.length)
    // тому повераємо стан і вказуємо, що він фінальний
    return [state, true];

  // Інашке ітеруємося по рядкам
  for(let i = 0; i < state.c.length; ++i) {
    // Якщо рядок не включає жодного виділеного нуля
    if(!state.c[i].includes(0))
      // То помічаємо цей рядок зірочкою 
      state.markedRows[i] = true;
  }

  // Ініціюємо змінну, котра відподвіє за те,
  // Чи було щось змінено на дані ітерації циклу
  let changed;
  do {
    // Встановлюємо її у логічний нуль
    changed = false;  

    // Ітеруємося по рядкам
    for(let i = 0; i < state.c.length; ++i) {
      // Якщо цей рядок помічений
      if(state.markedRows[i]) {
        // То ітеруємося по рядкам
        for(let j = 0; j < state.c[i].length; ++j) {
          // Якщо клітинка містить закреслений нуль
          if(state.c[i][j] === null) {
            // Й цей стовпець не був виділений раніше
            if(!state.markedColumns[j])
              // То змінну зміни ставимо у логічну одиницю
              changed = true;
            // Помічаємо зірочкою даний стовпець 
            state.markedColumns[j] = true;
          }
        }
      }
    }

    // Ітеруємося по стовпцям
    for(let j = 0; j < state.c[0].length; ++j) {
      // Якщо стовпець помічений
      if(state.markedColumns[j]) {
        // Ітеруємося по рядкам
        for(let i = 0; i < state.c.length; ++i) {
          // Ящко клітинка помечена виділеним нулем
          if(state.c[i][j] === 0) {
            // І цей рядок не був виділений раніше
            if(!state.markedRows[i])
              // То змінну зміни ставимо у логічну одиницю
              changed = true;
            // Помічаємо зірочкою даний рядок
            state.markedRows[i] = true;
          }
        }
      }
    }
    // Допоки щось змінюємо, продовжуємо цикл
  } while(changed)

  // Ініціалізуємо мінімальне значення нескінченністю
  let m = Number.POSITIVE_INFINITY;

  // Ітеруємося по клітинкам
  for(let i = 0; i < state.c.length; ++i) {
    for(let j = 0; j < state.c[i].length; ++j) {
      // По незакресленим клітинкам
      if(state.markedRows[i] && !state.markedColumns[j]) {
        // Знаходимо мінімум
        m = Math.min(m, state.c[i][j]);
      }
    }
  }

  // Ітеруємося по клітинкам
  for(let i = 0; i < state.c.length; ++i) {
    for(let j = 0; j < state.c[i].length; ++j) {
      // Для незакреслених клітинок
      if(state.markedRows[i] && !state.markedColumns[j]) {
        // Віднімаємо минулий мінус
        state.c[i][j] -= m;

        // Для закреслених два рази
      } else if (!state.markedRows[i] && state.markedColumns[j]) {
        // Додаємо минулий мінус
        state.c[i][j] += m;
      }
    }
  }

  // Повертаємо наступний стан і вказуємо, що він не кінцевий
  return [state, false];
}