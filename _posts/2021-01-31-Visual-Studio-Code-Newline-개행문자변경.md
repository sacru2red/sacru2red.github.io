---
layout : post
title : Visual-Studio-Code-Newline-개행문자변경
comments : true
tags : Visual-Studio-Code, vsc, newline, carriage-return, line-feed, LF, 개행문자, eslint
---

Expected linebreaks to be 'CRLF' but found 'LF'. eslint(linebreak-style)

새로운 환경에서 vsc을 구축할 일이 생겼다.

항상 제일 먼저하는 것은 환경설정이다.
그 중에서 vsc에서 환경설정 중 문제가 생겼다.

확장프로그램에서 eslint를 설치하고, 그에 해당하는 설정들을 했다.

내 경우에는 일반 타이핑은 대부분 vsc에서 처리하고
on Save에서 eslint fix가 동작하도록 설정한다.

코드 파일을 저장하니 아래와 같은 상태다.
[1]

혹시나 해서 다시 저장을 실행해봤다.
[2]
더 심해졌다.

한편, eslint의 출력은 아래와 같다.
[3]

구글링하니, 해당 옵션을 끄라고 하는 답변도 있다.
하지만, 다른 환경에서 이미 사용중인 옵션을 유지하고 싶었기 때문에
설정을 바꿔본다.

해당옵션
[4]

auto에서 \r\n (crlf)로 전역-작업영역에서 변경해보고 다시 vsc 로드하거나 재부팅해도 소용없었다.

한참을 고통받다가 해결했다.
vsc에서 아래 상태바에서 개행문자를 변경하는 것으로 해결했다.
[5]

편---안
[6][7]

