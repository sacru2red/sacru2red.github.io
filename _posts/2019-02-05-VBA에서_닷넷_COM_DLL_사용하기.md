---
layout : post
title : VBA에서 닷넷 COM DLL 사용하기
comments : true
tags : x86, x64, VBA, C#, 닷넷프레임워크, .Net Framework
---

C#으로 COM 인터페이스된 프로그램을 사용하기 위해서 몇시간 아니 몇십시간 낭비한 경험을 공유합니다.
C#을 다뤄본 적이 없기 때문에 맨땅에 헤딩하며 기록한 기본적인 지식들이 포함되어 있습니다.

우선 VBA 프로젝트에서 참조로 DLL 파일을 걸려고하니 "지정한 파일을 사용 가능한 참조로 추가할 수 없습니다."라는 메세지가 뜹니다.
닷넷프레임워크로 작성된 프로그램은 COM을 이용해서 통신을 할 수 있습니다.

COM에 대해서 [위키백과](https://ko.wikipedia.org/wiki/%EC%BB%B4%ED%8F%AC%EB%84%8C%ED%8A%B8_%EC%98%A4%EB%B8%8C%EC%A0%9D%ED%8A%B8_%EB%AA%A8%EB%8D%B8)에서 찾아봅니다.
마이크로소프트가 개발한 소프트웨어 구성 요소들의 응용 프로그램 이진 인터페이스(Application Binary Interface, ABI)이다.
COM을 이용해 개발된 프로그램들은 프로세스간 통신과 동적 오브젝트 생성이 가능하다.
OLE(Object Linking and Embedding, OLE), OLE 자동화, ActiveX, COM+, DCOM 기술을 포함하는 포괄적 개념으로 사용한다.

C# DLL을 COM으로 빌드해야합니다. Visual Studio와 디컴파일러를 설치합니다.
디컴파일을 실행한 후 VS로 오픈하고 솔루션 속성에 들어가서 
응용프로그램 => 어셈블리 정보(I)... 을 클릭하여 "어셈블리를 COM에 노출(M)"을 체크합니다.
[이미지](Assembly_Info)
빌드 => 출력항목의 "COM Interop 등록(C)"을 체크합니다.
[이미지](check_COM_Interop_등록)

[COM Interop](https://ko.wikipedia.org/wiki/COM_Interop)
COM Interop은 닷넷 프레임워크(.NET Framework)에서 공통 언어 런타임(CLR)에 포함된 컴포넌트 오브젝트 모델(COM) 개체를 상호 운용할 수 있게 만드는 기술이다. COM Interop은 COM 컴포넌트의 수정 없이 액세스할 수 있는 기능을 제공하며, COM 타입의 개체를 .NET 타입의 개체에 대응하도록 시도한다. 
그리고 COM Interop는 COM 개발자들이 COM 개체에 액세스하는 것만큼 쉽게 관리 개체에 액세스할 수 있도록 허용한다.
닷넷 프레임워크는 COM 컴포넌트가 등록되면 형식 라이브러리와 레지스트리 엔트리를 생성한다.

우측 프로젝트 탐색기 중 "AssemblyInfo.cs" 파일을 열어 "[ClassInterface(ClassInterfaceType.AutoDual)]" 코드를 추가해 속성을 변경합니다.
해당 특성 설정시 VBE에서 "ClassName."와 같이 입력하면 개체의 (인터페이스된) 프로퍼티와 메서드들이 리스팅되도록 바인딩 됩니다.

하지만 "AssemblyInfo.cs"에서 해당 특성을 설정하는 것은 ["CA1408: Do not use AutoDual ClassInterfaceType" 권장사항](https://docs.microsoft.com/ko-kr/visualstudio/code-quality/ca1408-do-not-use-autodual-classinterfacetype?view=vs-2019)에
어긋납니다. (이후의) 닷넷프레임워크의 버전에 따라 바인딩되는 부분이 다르게 표시될 수 있고, 
따로 신경써서 표시하지않는 한 모든 요소를 노출하게 될 우려가 있기 때문입니다.

따라서 노출할 인터페이스를 직접 서술하고 그 인터페이스에서 "[ClassInterface(ClassInterfaceType.AutoDual)]" 특성을 사용하는 것이 권장됩니다.

VS에서 빌드 => 솔루션 빌드를 하여서 DLL을 생성합니다. 해당 프로젝트 폴더\bin\Release(혹은 Debug) 디렉토리에서 DLL, TLB, PDB파일을 확인할 수 있습니다.

이제 엑셀을 열어 참조로 TLB파일을 지정합니다.
Type libraries(.TLB)는 이진파일로써 .DLL의 모든 프로시져나 클래스의 타입정보를 포함하고 있습니다.
비관리 프로그램에서 TLB파일을 읽어 개체에 접근 할 수 있습니다.

[관리코드와 비관리코드](https://guslabview.tistory.com/56)(간단하게 말하면 .Net Framework가 아닌 경우를 칭함)

이제 DLL 개체에 접근하는 VBA 코드를 작성합니다.

여전히 작동하지 않는 경우가 있습니다. 다시 VS를 열어봅니다. 여기에서 시간낭비를 많이 했는데, 빌드 속성을 바꿔야합니다.
"솔루션 속성 => 빌드 => 플랫폼 대상(G):"의 값이 설치된 MS Office 비트버전과 같아야합니다.
[링크](https://sacru2red.github.io/x86_x64_32%EB%B9%84%ED%8A%B8%EC%99%80-64%EB%B9%84%ED%8A%B8_%ED%94%84%EB%A1%9C%EC%84%B8%EC%8A%A4/)

다시 시도해봅니다. 아마 정상적으로 작동할 것입니다. 잘 되지 않는다면 댓글로 남겨주세요.
고생하셨습니다.

+
이렇게 작성한 VBA 프로젝트가 포함된 엑셀파일을 배포하려면 어떻게해야 할까요?
제가 생각한 방법은 x64, x86 DLL 파일을 두개를 만들어 놓고, COM을 등록하는 bat파일을 함께 배포하는 것입니다.

방금 개발환경에서는 COM을 등록하는 과정을 VS가 해주었지만 클라이언트 PC에서는 직접등록해주어야합니다.
일반적인 COM 즉, 비 관리 DLL을 COM 서버로 등록할 때에는 regsvr32.exe를 사용하지만
COM으로 노출된 닷넷 어셈블리를 COM 서버로 등록하기 위해서는 regasm.exe를 사용합니다. 
어셈블리에 저장된 형식 정보를 검사하고 COM에서 노출 된 엔터티를 형식 라이브러리(TLB)에 포함시킬 수 있습니다.

참고로 비관리 DLL의 TLB는 regtlib.exe나 regtlibv12.exe로 등록가능하고 관리 DLL은 regasm의 /tlb: 옵션을 사용해 등록가능합니다.

regasm를 실행할 때는 codebase 옵션을 실행하여야 합니다.
이 옵션은 동일한 PC에서 다른 응용 프로그램이, 즉 COM을 호출하는 프로그램이 접근 가능하도록 연결을 하겠다는 것입니다.

regasm.exe는 닷넷프레임워크 디렉토리에 있습니다. 일반적으로는 "C:\Windows\Microsoft.NET\Framework64\v4.0.30319" 디렉토리의 것을 사용하면 되는데
다양한 경우의 수를 고려해서 다음과 같이 bat파일을 작성했습니다.

@echo off
echo * 관리자권한으로 실행해주세요 * 
echo  프로그램을 윈도우에 등록합니다.
echo.
%WINDIR%\Microsoft.Net\Framework64\v2.0.50727\RegAsm.exe %~dp0%\my.dll /tlb /codebase
if ERRORLEVEL 100 (
	%WINDIR%\Microsoft.Net\Framework\v2.0.50727\RegAsm.exe %~dp0%\my.dll /tlb /codebase
)
echo "등록종료"
pause
