# codelinters

## JavaScript

### bitbucket-pipelines.yml
Этот файл содержит команды, которые запускаются при каждом push на сервер для каждого коммита. Bitbucket Pipeline будет разворачивать ноду и выполнять следующие команды:
```
npm install
npm run eslint-check-commit
```
Эти компанды запускаются на каждый коммит. Если в одном пуше было 5 коммитов, то скрипт запустится для каждого из них.

`eslint-check-commit` скрипт описан в файле package.json и разворачивается в такую команду
```
LIST=`git diff $BITBUCKET_COMMIT~1 --name-only --cached | grep '.*\.js$'`; if [ "$LIST" ]; then eslint $LIST; fi
```
`$BITBUCKET_COMMIT` это глобавльная переменная, которая есть в Bitbucket Pipeline. 
Она хранит в себе номер id ветки текущего коммита. 

Соответственно мы получаем все файлы которые изменились в коммите 
```
git diff $BITBUCKET_COMMIT~1 --name-only --cached
```

И из них нас интересуют только `*.js` файлы
```
grep '.*\.js$'
```

Мы их загружаем в пемеренную `LIST` и запускаем `eslint` для этих файлов, если они есть

```
LIST=`...`; if [ "$LIST" ]; then eslint $LIST; fi
```

### package.json

В нём стоят основные пакеты, которые обеспечивают работу `eslint`. Сам `eslint` нам ставить не надо, он идёт внутри `react-scripts`. Мы используем правила AirBnB
```
"eslint-config-airbnb":   "^17.1.0"
"eslint-plugin-import":   "^2.16.0"
"eslint-plugin-jsx-a11y": "^6.2.1"
"eslint-plugin-react":    "^7.12.4"
```

Далее идут пакеты, которые запускают `eslint` для всех файлов с `*.js` расширением

```
"husky":       "^1.3.1"
"lint-staged": "^8.1.3"
```

`husky` позволяет запускать скрипты на действия гита. В данном случае мы запускаем пакет `lint-staged` 
```
"husky": {
  "hooks": {
    "pre-commit": "lint-staged"
  }
}
```

`lint-staged` в свою очередь позволяет запускать скрип для всех файлов, которые попали в коммит
```
"lint-staged": {
  "*.js": [
    "eslint --fix",
    "git add"
  ]
}
```

Каждый файл мы правим с помощью `eslint --fix`, а затем добавляем их в коммит с помощью `git add`

### .eslintrc.js

Тут лежат настройки `eslint`. Почему именно `*.js` файл, а не `*.json`? Я не знаю, по другому не работало.

### Внимание

Если эти пакеты не будут установлены, то автоматического форматирования добавленных файлов не будет, и они будут проверяться на сервере. 
Если, конечно в репозитории включен Bitbucket Pipelines

### Использование

Скопировать файлы `.eslintrc.js`, `bitbucket-pipelines.yml` и `.editorconfig` в проект;

Ставим новые пакеты:
```
npm i --D eslint-config-airbnb@latest eslint-plugin-import@latest eslint-plugin-jsx-a11y@latest eslint-plugin-react@latest husky@latest lint-staged@latest
```

Перенести скрипты в `"scripts"` в `package.json` в новый проект:
```
"eslint-fix": "eslint 'src/**/*.js' --fix",
"eslint-fix-staged": "LIST=`git diff --name-only --cached | grep '.*\\.js$'`; if [ \"$LIST\" ]; then eslint $LIST --fix; fi",
"eslint-check-commit": "LIST=`git diff $BITBUCKET_COMMIT~1 --name-only --cached | grep '.*\\.js$'`; if [ \"$LIST\" ]; then eslint $LIST; fi"
```

Вставить новые крипты для `husky` и `lint-staged` в корень `package.json`:
```
"husky": {
  "hooks": {
    "pre-commit": "lint-staged"
  }
},
"lint-staged": {
  "*.js": [
    "eslint --fix",
    "git add"
  ]
}
``` 

В итоге должно получиться примерно такой файл:
```
{
  "dependencies": {
    ...
  },
  "devDependencies": {
    ...
  },
  "scripts": {
    ...
    "eslint-fix": "eslint 'src/**/*.js' --fix",
    "eslint-fix-staged": "LIST=`git diff --name-only --cached | grep '.*\\.js$'`; if [ \"$LIST\" ]; then eslint $LIST --fix; fi",
    "eslint-check-commit": "LIST=`git diff $BITBUCKET_COMMIT~1 --name-only --cached | grep '.*\\.js$'`; if [ \"$LIST\" ]; then eslint $LIST; fi"
  },
  "husky": {
    "hooks": {
      "pre-commit": "lint-staged"
    }
  },
  "lint-staged": {
    "*.js": [
      "eslint --fix",
      "git add"
    ]
  }
}

```

Удалите строчку `"eslint --fix",` в пакете в проекте;

Запустите автофикс проекта и запушьте изменения:
```
npm run eslint-fix
git add .
git commit -m 'Added eslint to project'
```

Включите проверку файлов перед коммитом, вернув удалённую строку (`"eslint --fix",`) в `"lint-staged"` в файле `package.json`

Добавьте его и сделайте коммит и пуш:
```
git add .
git commit -m 'Turned on pre-commit hooks'
```

#### Почему так сложно? Хочу одной командой всё сделать?

Это самый безболезненный способ перевести любой проект на eslint. Вы сначала фиксите его, а потом включаете проверку на клиенте и на сервере

В результате, форматирование будет соблюдено, но локальные ошибки, вроде неиспользуемых переменных или импортов останутся.

Они будут решаться, когда разработчик изменить файл и он попадёт в коммит. Тогда получится, что каждый будет править файлы по мере их необходимости.

Если разрабочик закомментирует или удалит строку `"eslint --fix",` и не добавит её в commit, то проверки проходиться не будут и мы не узнаем об этом.

Для этого есть Bitbucket Pipeline, который проверяет то-же самое на сервере, но уже без фиксов и помечает коммит зелёным, если всё окей и красным, если проверка не пройдена.
