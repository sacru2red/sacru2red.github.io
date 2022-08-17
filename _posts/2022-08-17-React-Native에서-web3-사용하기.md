---
layout: post
title: React-Native에서 web3 사용하기
comments: true
tags: React-Native, rn, web3, browserify, Ethereum, wallet
---

# 서론

javascript로 프로그램을 작성할 때는 오픈 소스 라이브러리(주로 npm registry에 공개된)를 많이 사용하게 된다.

javascript의 런타임은 브라우저가 기본이었으나, V8의 발전으로 Nodejs가 등장했고
그 외에도 일렉트론, Deno, React-Native 등 다양한 런타임이 등장했다.

대부분의 라이브러리는 특정 런타임을 대상으로 개발되기 마련이다.

그 중에 Nodejs에서 동작하는 라이브러리는 특히 다른 런타임에서 동작하기 어렵다.
런타임 별로 동작하는 글로벌 객체의 차이 외에도 Nodejs의 런타임에서 제공하는 노드 코어 모듈이 있기 때문이다.
예를 들어 buffer, event 같은 모듈들이 있다.

브라우저에서도 Nodejs의 라이브러리를 동작시키기 위한 프로젝트들은 여럿 있어왔다.

비슷하지만 조금 다르게, 나는 React-Native 환경에서 Nodejs의 라이브러리를 사용해야 했다.
블록체인 패키지들[[web3js(web3)](https://github.com/ChainSafe/web3.js), [EthereumJS](https://github.com/ethereumjs/ethereumjs-monorepo)]을 사용하는 지갑앱을 만들어야 했기 때문이다.

web3js 프로젝트에서는 브라우저에서 동작하기 위해 어떤 식으로 처리해야 하는지 가이드라인도 제공하고 있다. [링크](https://github.com/ChainSafe/web3.js#troubleshooting-and-known-issues)

```
const webpack = require('webpack');

module.exports = function override(config) {
    const fallback = config.resolve.fallback || {};
    Object.assign(fallback, {
        "crypto": require.resolve("crypto-browserify"),
        "stream": require.resolve("stream-browserify"),
        "assert": require.resolve("assert"),
        "http": require.resolve("stream-http"),
        "https": require.resolve("https-browserify"),
        "os": require.resolve("os-browserify"),
        "url": require.resolve("url")
    })
    config.resolve.fallback = fallback;
    config.plugins = (config.plugins || []).concat([
        new webpack.ProvidePlugin({
            process: 'process/browser',
            Buffer: ['buffer', 'Buffer']
        })
    ])
    return config;
}
```

노드 코어 모듈을 resolve할 때 노드 코어 모듈에 대응하는 browserify 라이브러리로 resolve해서 구동되도록 설정하라는 것이다.
그렇다면 React-Native에서는 어떻게 해야 할까

# 방법

1. [rn-nodeify](https://github.com/tradle/rn-nodeify) 이용하기

조금은 과격한 방법이라고 할 수 있다.
명령어도 `rn-nodeify --hack`이다.
core node modules용 shims을 주입한다고 얘기할 수 있다.
명령어를 사용한다면 (`ex) rn-nodeify --install "fs,dgram,process,path,console"`) 당신이 작업하고 있는 프로젝트에 설치된 라이브러리(node_module) 내 package.json의 내용을 변경한다. 정확히는 아래와 같은 구문을 추가한다.

```
...
"react-native": {
    "fs": "react-native-fs"
}
"browser": {
    "fs": "react-native-fs"
}
...
```

즉, 패키지를 resolve 할 때 react-native 런타임용 패키지로 resolve 하도록 하는 것이다.
과격하지만, 큰 문제없이 프로젝트는 돌아간다.
rn-nodeify 프로젝트의 README 내용처럼 postinstall 스크립트도 설정해둔다면
패키지를 설치한 후 package.json이 원래 상태로 돌아가더라도 다시 hack된 상태로 변경해 준다.

문제는 React-Native 역시 런타임이 늘어 났다는 것이다. 처음에는 Android와 IOS만 있었지만, Web과 Windows 등 다양한 런타임을 추가하려는 프로젝트가 생겼고,
React-Native의 슬로건 "write once run anywhere"를 이룰 수 있게 됐다.

같은 소스코드로도 Web 환경을 돌려야 하는 내 작업환경에서는 선택할 수 없었다.
즉, 이 방법을 쓰는 경우에는 모든 resolve가 Android, IOS를 위한 설정으로 덮이게 되고, 내가 찾은 바로는 각각의 런타임 별로 디테일하게 설정해 줄 수 없었다.
(rn-nodeify는 React-Native 초창기에 개발된 라이브러리이다.)

2. [node-libs-react-native](https://github.com/parshap/node-libs-react-native) 이용하기

[node-libs-browser](https://github.com/webpack/node-libs-browser)라는 라이브러리가 있다. 노드 코어 모듈에 매칭되는 browserfy 모듈들을 설정해 놓은 파일을 제공한다.
위에서 web3의 가이드라인에서 말한 방법과 유사하다고 보면 된다.

node-libs-react-native는 node-libs-browser의 포크 프로젝트로 React-Native에서 사용할 수 있는 라이브러리들을 매칭시켜놨다.

rn-nodeify의 방법보다 과격하지도 않고, 유연하게 대처할 수 있다.
node-libs-react-native를 패치해서 일부 코어 모듈은 내가 원하는 패키지로 대채할 수도 있고, 아예 node-libs-react-native를 안쓰고, 파일만 참고해서 내가 직접 만들어 대응할 수도 있다.

나는 이 방법을 사용하고자 했는데, 한가지 걸림돌이 되는 부분이 있었다.

첫번째로 crypto는 react-native-crypto로 resolve 되도록 되어 있었는데
react-native-crypto에서 의존 패키지들이 꼬여 있었다.
예컨데 react-native-crypto에서 randomBytes는 react-native-randombytes를 쓰고
react-native-randombytes에서 sjcl이라는 패키지를 쓰는 sjcl에서 crypto 모듈을 임포트하고 있었다.
crypto(react-native-crypto) -> randombytes(react-native-randombytes) -> sjcl -> crypto
이러한 순환(recursive) 종속성이 발생했다.

두번째로 crypto에는 pbkdf2라는 암호화모듈을 써야했다.
다행히 [pbkdf2](https://github.com/crypto-browserify/pbkdf2)라고 하는 브라우저용 모듈로 대체되도록 설정되어있었지만, React-Native 환경에서 문제가 발생했다.
React-Native의 JSC, Hermes에서 pbkdf2를 호출하여 암호화를 하면 실행시간이 비정상적으로 오래 걸렸다. Nodejs나 Web에서는 1초안에 끝나는 연산이 3~4분 소요된 것이다. 추측으로는 아직 Js 연산의 최적화가 되지 않은 것 같았다. 암호화 모듈의 특성상 반복되는 연산은 수천번을 하는 경우가 있는데, 엔진최적화가 되지 않은 듯 했다.
암호화 연산을 네이티브 영역 (Android, IOS)에서 해야 했다.

세번째로는 readable-stream에서 순환 종속성이 발생했다.
이 문제는 readable-stream@3에서 해결된 것으로 확인했는데,
readable-stream@2를 사용하고 있었다.
(이건 사실 다른 꼼수로 해결 할 수 있다. root 프로젝트에서 readable-stream@3를 설치하고 resolve를 root 프로젝트에서 babel이나 metro에서 readable-stream@3로 처리하면 된다.)

3. 내가 선택한 방법

node-libs-react-native를 포크해서 해결했다.
내가 겪었던 문제

- crypto의 순환 종속성
- 암호화 모듈 pbkdf2의 연산 시간 문제
- readable-stream의 순환 종속성
  를 해결했다.

첫번째 문제는 react-native-randombytes를 포크한 뒤 수정했다.
두번째 문제는 react-native-fast-pbkdf2를 포크한 뒤 수정했다.
세번째 문제는 readable-stream의 버전을 올려 수정했다.

그리고 프로젝트를 오픈 소스로 공개했다.
[react-native-module/node-libs-react-native](https://github.com/react-native-module/node-libs-react-native)

[설치](https://github.com/react-native-module/node-libs-react-native#installation)하고 [설정법1](https://github.com/react-native-module/node-libs-react-native#usage), [설정법2](https://github.com/react-native-module/node-libs-react-native#support-additional-packages)을 따라한다면 정상적으로

web3js, EthereumJS와 같은 라이브러리를 React-Native에서 사용할 수 있을 것이다.

ps. [@react-native-module/pbkdf2](https://github.com/react-native-module/pbkdf2)에서 IOS 부분은 사용할 수 없다. PR 환영.
