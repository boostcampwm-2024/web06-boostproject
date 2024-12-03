<div align="center">
  <a href="https://boost-harmony.kro.kr" title="일정관리 Harmony">
    <img src="https://github.com/user-attachments/assets/8efd5375-964f-4390-95b1-9ad5b72c5e98">
  </a>

 <br />
 <br />

[🔗 배포 링크](https://boost-harmony.kro.kr)

[🔗 팀 노션](https://harmony-by-4card.notion.site/Harmony-133c9475000c80d88c9cdda300b6b4cd)
[🔗 팀 위키](https://github.com/boostcampwm-2024/web06-harmony/wiki)

</div>

<br />
<br />

## 프로젝트 소개

**Harmony** 는 기존 프로젝트 관리 도구의 불편함을 해결하기 위해 탄생한 실시간 일정관리 서비스입니다.

- **실시간 일정관리**  
  기존 일정관리 서비스(Github Project)의 비동기적인 관리 방식을 개선하기 위해 실시간 편집 및 반영을 지원합니다.
- **플래닝 포커**  
  별도의 외부 서비스를 이용하는 불편함을 해소하기 위해 플래닝 포커 기능을 지원합니다.

<br />
<br />

## 핵심 기능

### 프로젝트 관리

- 프로젝트를 생성하고 다른 사용자를 초대할 수 있습니다.

| <img width="380" alt="프로젝트 생성 및 초대" src="https://github.com/user-attachments/assets/1355f8b1-a7da-4e2a-8d50-c2a5d6611c0f" /> | <img width="380" alt="초대 승인 및 거절" src="https://github.com/user-attachments/assets/50da2258-3b5c-4bc9-9861-f4d8e93c87a2" /> |
| :-----------------------------------------------------------------------------------------------------------------------------------: | :-------------------------------------------------------------------------------------------------------------------------------: |
|                                                         프로젝트 생성 및 초대                                                         |                                                         초대 승인 및 거절                                                         |

<br />

### 실시간 편집 및 반영

- 태스크를 생성하고 상태를 관리할 수 있습니다.
- 편집한 내용은 다른 사용자에게 실시간으로 반영됩니다.

<img width="1200" alt="실시간 편집 및 반영" src="https://github.com/user-attachments/assets/5f9209f5-a8a3-4918-8af5-9ca9ae3347b2" />

<br />

### 태스크 관리

- 태스크 설명을 작성하고, 하위 태스크를 지정할 수 있습니다.
- 담당자, 라벨, 우선순위, 스프린트, 예상 작업 시간을 지정할 수 있습니다.

<img width="1200" alt="태스크 관리" src="https://github.com/user-attachments/assets/45ece965-e5af-4249-8ceb-837437fd442a" />

<br />

### 플래닝 포커

- 플래닝 포커에 참여하고 카드를 선택해 제안할 수 있습니다.
- 다른 사람이 선택한 카드를 확인할 수 있습니다.

<img width="1200" alt="플래닝 포커" src="https://github.com/user-attachments/assets/18d1a7c7-e3d5-438c-9d4f-606fe55a3a9c" />

<br />

### 대시보드

- 프로젝트의 작업 현황, 담당자별 기여도, 우선순위 통계를 확인할 수 있습니다.

<img width="1200" alt="대시보드" src="https://github.com/user-attachments/assets/8e21bc87-93eb-487c-b664-57a3e3629e59">

<br />
<br />

## 핵심 경험

### Long Polling 을 선택한 이유

실시간 편집 및 반영을 위해 Polling, SSE, WebSocket 중 어떤 기법을 사용할지 고민했습니다.  
**"직접 경험해보고 판단하자"** 라는 팀 목표에 맞게, 실제로 서비스에 다양한 기법을 적용하려 했습니다.  
다만, 일정을 고려해서 Long Polling 과 WebSocket 을 사용해보기로 결정했고,  
서비스의 특성상 높은 실시간성을 필요로 하지 않아 Long Polling 을 먼저 적용해보기로 했습니다.

<br/>

### Long Polling 의 한계

실시간 반영을 위해 두 가지 업데이트 방식을 고려할 수 있었습니다.

| 전체 업데이트<br/>(선택) | <img width="600" alt="전체 업데이트" src="https://github.com/user-attachments/assets/9b229309-dc3a-4379-88d0-6b288dbb4819"> |
| :----------------------: | :-------------------------------------------------------------------------------------------------------------------------- |
|      부분 업데이트       | <img width="600" alt="부분 업데이트" src="https://github.com/user-attachments/assets/6e9695b8-da6f-44f5-a250-860822ad8a8b"> |

롱폴링은 재연결 과정에서 이벤트가 누락될 가능성이 있습니다.  
이를 고려하여 이벤트를 받아오는 것이 아닌 전체 데이터의 스냅샷 형태로 받고자 했습니다.

<br/>

하지만, 이 방식은 커서를 강탈당하는 문제가 있어 동시 편집이 불가능했습니다.

<img width="600" alt="동시 편집 불가 사진" src="https://github.com/user-attachments/assets/9ee1eb74-34b7-4854-8d33-7636bf73ad10">

그래서 부분 업데이트 방식으로 변경했습니다.  
처음에 예상했던 대로 부분 업데이트는 재연결 과정에서의 이벤트 누락이 발생했습니다.

| <img width="380" alt="위치 이동 이벤트 누락" src="https://github.com/user-attachments/assets/26206d07-c75b-42ae-96a1-e7a7cb68b96d" /> | <img width="380" alt="초대 승인 및 거절" src="https://github.com/user-attachments/assets/0676e596-1fd0-4984-a47b-93f53423cacc" /> |
| :-----------------------------------------------------------------------------------------------------------------------------------: | :-------------------------------------------------------------------------------------------------------------------------------: |
|                                                         위치 이동 이벤트 누락                                                         |                                                      텍스트 편집 이벤트 누락                                                      |

<br/>

### Long Polling 개선하기

우선, 이벤트의 누락이 얼마나 발생하는지 확인했습니다.  
K6 를 활용해 100명의 수신자를 기준으로, 0.1초부터 1초까지 RPS(초당 요청 수)를 조정하며 **응답을 성공적으로 수신하는 비율**을 측정했습니다.  
테스트 결과, 500ms 보다 좁은 간격으로 이벤트가 발생하면, 누락률이 급격히 증가하는 것을 확인할 수 있었습니다.

<img width="600" alt="테스트 결과" src="https://github.com/user-attachments/assets/dd0ee87c-c733-4ded-9020-716ba45caddf">

이를 해결하기 위해 **버저닝**과 **스케줄링**을 적용하고자 했습니다.

| <img width="600" alt="버저닝" src="https://github.com/user-attachments/assets/5be7e1f5-5882-4ad5-8167-3239901d34d9"> | <img width="600" alt="버저닝" src="https://github.com/user-attachments/assets/d63c1ebf-6706-4fc1-9ba2-cd8cbad54799"> |
| :------------------------------------------------------------------------------------------------------------------: | :------------------------------------------------------------------------------------------------------------------: |
|                                                        버저닝                                                        |                                                       스케줄링                                                       |

타임스탬프를 활용한 버저닝을 적용해, 재연결 사이에 발생한 이벤트들을 목록으로 가져오면 누락을 줄일 수 있을 것이라 생각했습니다.  
추가로 Long Polling 의 재연결 횟수를 줄이기 위해 스케줄링을 적용할 수 있을 것이라 생각했습니다.

이 방식을 적용하기 전, 실제 개선 효과가 있을지 검증하기 위해 테스트를 진행했습니다.  
위와 같은 조건으로 **응답을 성공적으로 수신하는 비율**을 측정했습니다.

<img width="600" alt="테스트 결과" src="https://github.com/user-attachments/assets/e6237425-41cb-447d-a841-ed38f92775ed">

해당 방식을 적용하면 기존 방식 대비, RPS에 따라 **0.4%** 부터 최대 **16.8%** 까지 누락률을 줄일 수 있음을 확인했습니다.  
그래서, **버저닝**과 **스케줄링**을 적용해 실제 사용성을 높일 수 있었습니다.

<br />
<br />

## 시스템 아키텍처

<img width="1200" alt="시스템 아키텍처" src="https://github.com/user-attachments/assets/41ae31c5-f08c-45ce-94f4-c38b4e3272fe">

<br />
<br />

## 기술 스택

| 분야 | 기술 |
| ---- | ---- |

|
공통 | <img src="https://img.shields.io/badge/typescript-3178C6?style=for-the-badge&logo=typescript&logoColor=white"><img src="https://img.shields.io/badge/socket.io-010101?style=for-the-badge&logo=socket.io&logoColor=white"> |
|
FE | <img src="https://img.shields.io/badge/react-61DAFB?style=for-the-badge&logo=react&logoColor=white"><img src="https://img.shields.io/badge/tanstack query-FF4154?style=for-the-badge&logo=react-query&logoColor=white"><img src="https://img.shields.io/badge/tanstack%20router-FF4154?style=for-the-badge&logo=react-query&logoColor=white"><br><img src="https://img.shields.io/badge/framer%20motion-0055FF?style=for-the-badge&logo=framer&logoColor=white"><img src="https://img.shields.io/badge/shadcn-4F46E5?style=for-the-badge&logo=tailwindcss&logoColor=white"><img src="https://img.shields.io/badge/tailwind%20css-38B2AC?style=for-the-badge&logo=tailwindcss&logoColor=white"> |
|
BE | <img src="https://img.shields.io/badge/nestjs-E0234E?style=for-the-badge&logo=nestjs&logoColor=white"><img src="https://img.shields.io/badge/typeorm-FFA500?style=for-the-badge&logo=typeorm&logoColor=white"><img src="https://img.shields.io/badge/sharedb-1D4ED8?style=for-the-badge&logo=databricks&logoColor=white"><img src="https://img.shields.io/badge/mysql-4479A1?style=for-the-badge&logo=mysql&logoColor=white"> |

<br />
<br />

## 팀원 소개

|                                             김정한                                             |                                           나주엽                                            |                                             서완석                                             |                                             양희철                                              |
| :--------------------------------------------------------------------------------------------: | :-----------------------------------------------------------------------------------------: | :--------------------------------------------------------------------------------------------: | :---------------------------------------------------------------------------------------------: |
|                                               BE                                               |                                             FE                                              |                                               FE                                               |                                               BE                                                |
| <img src="https://avatars.githubusercontent.com/u/77607258?v=4" alt="jjeonghak" width="120" /> | <img src="https://avatars.githubusercontent.com/u/101315505?v=4" alt="PMtHk" width="120" /> | <img src="https://avatars.githubusercontent.com/u/81221398?v=4" alt="jjeonghak" width="120" /> | <img src="https://avatars.githubusercontent.com/u/113877384?v=4" alt="jjeonghak" width="120" /> |
|                            [jjeonhak](https://github.com/jjeonghak)                            |                              [PMtHk](https://github.com/PMtHk)                              |                              [iam454](https://github.com/iam454)                               |                            [yangchef1](https://github.com/yangchef1)                            |
