# YD MES PROJECT
<img width="1891" height="939" alt="메인" src="https://github.com/user-attachments/assets/4d1e5bff-d2dd-426f-bdac-2ad78dee168d" />

## 📑 바로가기

<p align="center">
  <a href="#프로젝트-개요"><kbd>📘 프로젝트 개요</kbd></a>
  &nbsp;&nbsp;
  <a href="#내-파트"><kbd>🧩 내 파트</kbd></a>
  &nbsp;&nbsp;
  <a href="#프로젝트-소감"><kbd>📝 프로젝트 소감</kbd></a>
  &nbsp;&nbsp;
  <a href="#Project-Structure"><kbd>📁 Project Structure</kbd></a>
</p>

---

## 프로젝트 개요

본 프로젝트는 **라면 공장의 생산 공정을 대상으로 한 MES 기반 생산 관리 시스템**입니다.  
생산 계획, 작업 지시, 공정 진행, 설비 및 생산 실적 데이터를 실시간으로 수집·관리하여  
**생산 과정의 가시성과 효율성**을 향상시키는 것을 목표로 구현되었습니다.

### 개발 일정
- **2025.12.03 ~ 2025.12.09**

### 메인 링크
- 🔗 https://github.com/islbvv/YD_MES_Project


## 팀 구성 및 역할

<!-- 팀원 소개 테이블 -->
<table border="1" cellpadding="12" cellspacing="0" align="center" >
  <tr>
    <th align="center">도우서</th>
    <th align="center">배진욱</th>
    <th align="center">김동우</th>
    <th align="center">박희찬</th>
    <th align="center">권수민</th>
  </tr>
  <tr>
    <td align="center">
      <img  width="120" alt="image" src="https://github.com/user-attachments/assets/fd2ed4de-b16c-4339-a6f7-bc8f4d846d29" />
    </td>
    <td align="center">
      <img width="120" alt="male" src="https://github.com/user-attachments/assets/4c713a36-ac69-4107-bf2e-e7de21af0f90" />
    </td>
    <td align="center">
      <img width="120" alt="male" src="https://github.com/user-attachments/assets/4c713a36-ac69-4107-bf2e-e7de21af0f90" />
    </td>
    <td align="center">
      <img width="120" alt="male" src="https://github.com/user-attachments/assets/4c713a36-ac69-4107-bf2e-e7de21af0f90" />
    </td>
    <td align="center">
      <img width="120" alt="female" src="https://github.com/user-attachments/assets/8d5708ba-b9f8-41e6-bd47-7c5e777a0088" />
    </td>
  </tr>
  <tr>
    <td align="center">생산</td>
    <td align="center">DB관리 </br> 생산</td>
    <td align="center">기준정보</td>
    <td align="center">기준정보</td>
    <td align="center">주문</td>
  </tr>
</table>
<table border="1" cellpadding="12" cellspacing="0" align="center" >
  <tr>
    <th align="center">성찬혁</th>
    <th align="center">정재은</th>
    <th align="center">박세민</th>
    <th align="center">송승일</th>
    <th align="center">김현태</th>
  </tr>
  <tr>
    <td align="center">
      <img width="120" alt="male" src="https://github.com/user-attachments/assets/4c713a36-ac69-4107-bf2e-e7de21af0f90" />
    </td>
    <td align="center">
      <img width="120" alt="female" src="https://github.com/user-attachments/assets/8d5708ba-b9f8-41e6-bd47-7c5e777a0088" />
    </td>
    <td align="center">
      <img width="120" alt="male" src="https://github.com/user-attachments/assets/4c713a36-ac69-4107-bf2e-e7de21af0f90" />
    </td>
    <td align="center">
      <img width="120" alt="male" src="https://github.com/user-attachments/assets/4c713a36-ac69-4107-bf2e-e7de21af0f90" />
    </td>
    <td align="center">
      <img width="120" alt="male" src="https://github.com/user-attachments/assets/4c713a36-ac69-4107-bf2e-e7de21af0f90" />
    </td>
  </tr>
  <tr>
    <td align="center">주문</td>
    <td align="center">자재</td>
    <td align="center">자재</td>
    <td align="center">품질</td>
    <td align="center">품질</td>
  </tr>
</table>


---

## 개발 환경
```
[FRONT]    JavaScript, Vue.js, HTML, CSS  
[BACK]     Express.js  
[DATABASE] MariaDB  
[TOOL]     Git, NAVER Cloud Platform, VS Code
```

## 프로세스 흐름도

<img width="1203" height="679" alt="image" src="https://github.com/user-attachments/assets/1e14d6f1-058f-42ba-a399-3da689bc86cd" />

---

<p align="center">
  <a href="#프로젝트-개요"><kbd>📘 프로젝트 개요</kbd></a>
  &nbsp;&nbsp;
  <a href="#내-파트"><kbd>🧩 내 파트</kbd></a>
  &nbsp;&nbsp;
  <a href="#프로젝트-소감"><kbd>📝 프로젝트 소감</kbd></a>
  &nbsp;&nbsp;
  <a href="#Project-Structure"><kbd>📁 Project Structure</kbd></a>
</p>

---

## 내 파트

본 프로젝트에서 생산 관리 파트를 담당하였으며,  
등록된 작업 지시서를 기반으로 해당 제품의 작업 공정을 호출하고  
**공정별 장비 선택 및 작업 시작·종료 처리 기능**을 구현하였습니다.  

작업 진행 과정에서 생산 수량, 공정 상태 등의 데이터를 실시간으로 반영하여  
생산 흐름을 관리하였으며,  
**작업 완료 시 최종 생산 실적**을 시스템에 등록하여  
생산 이력 및 실적 데이터가 누적·관리될 수 있도록 구성하였습니다.  

이를 통해 작업자는 명확한 공정 흐름에 따라 생산을 진행할 수 있고,  
관리자는 **생산 현황과 실적을 실시간**으로 확인할 수 있도록 하였습니다.

---

## 내 파트 페이지별 기능

#### 작업 진행 목록
<p align="center">
  <img width="1919" height="944" alt="MES 작업진행목록" src="https://github.com/user-attachments/assets/d86ce858-7b49-4e75-95c6-7507c8aca2c6" />
</p>

+ 작업지시서에 등록된 제품들의 현재 진행 상태를 확인할 수 있는 페이지입니다.  
+ 해당 지시서를 선택해 작업 공정 확인 및 생산 설비 페이지로 접근 가능합니다.
+ 체크박스를 통해 체크한 항목의 지시서들을 엑셀로 다운 가능합니다.

---

#### 작업 공정
<p align="center">
  <img width="420" height="942" alt="MES 작업공정" src="https://github.com/user-attachments/assets/9d0a363d-b50f-48c2-9ea5-babb61c13232" />
  <img width="420" height="720" alt="MES 작업공정상세" src="https://github.com/user-attachments/assets/69a88123-a45e-4f47-a7cd-d6b7b2240c57" />
</p>

+ 작업 진행 목록에서 선택한 제품의 작업 상세 작업 공정을 확인 가능합니다.
+ 생산 시작 전 이라면 첫번째 항목에서 설비를 클릭하면 생산 장비 페이지로 이동하며  
  장비를 선택후 생산을 시작할 수 있습니다.
+ 모든 작업이 완료되면 마지막 행에서 설비를 클릭해서 생산 종료가 가능합니다.
+ 실시간으로 현재 생산 상태를 확인 가능합니다.  
  생산 완료는 녹색, 생산 중은 노랑, 생산 전은 회색으로 구분되어 표시됩니다.
  
<p align="center">
  <img width="1901" height="941" alt="생산현황" src="https://github.com/user-attachments/assets/93c73232-0769-480b-b712-95057fb38b60" />
</p>

---

#### 생산 장비 및 생산 시작/종료
<p align="center">
  <img width="420" height="935" alt="MES 생산시작" src="https://github.com/user-attachments/assets/923c09c9-9bfe-400d-8f1d-4db35b2c99b7" />
  <img width="420" height="939" alt="MES 생산상세" src="https://github.com/user-attachments/assets/e5c179c9-f00d-4a6c-a339-dd92a1bd92c7" />
</p>

+ 현재 가동 가능한 장비를 보여주며 해당 작업에 맞는 장비를 선택 후 생산 시작을 누르면 생산이 진행 됩니다.  
+ 최종적으로 모든 공정이 끝나면 생산 완료 버튼을 클릭 하면  
  생산 수량을 확인 가능하며 생산 공정이 종료됩니다.

---
#### 작업 실적
<p align="center">
  <img width="1901" height="941" alt="생산실적" src="https://github.com/user-attachments/assets/9f48772f-e021-4034-ab26-529a7181eb35" />
</p>

+ 최종적으로 생산이 완료된 제품의 생산 실적이 확인 가능합니다.
+ 체크박스를 통해 체크한 항목의 지시서들을 엑셀로 다운 가능합니다.

---

<p align="center">
  <a href="#프로젝트-개요"><kbd>📘 프로젝트 개요</kbd></a>
  &nbsp;&nbsp;
  <a href="#내-파트"><kbd>🧩 내 파트</kbd></a>
  &nbsp;&nbsp;
  <a href="#프로젝트-소감"><kbd>📝 프로젝트 소감</kbd></a>
  &nbsp;&nbsp;
  <a href="#Project-Structure"><kbd>📁 Project Structure</kbd></a>
</p>

---

## 프로젝트 소감

MES 프로젝트에서 **생산 관리 파트**를 담당하며,  
**다수의 테이블을 연계하여 하나의 조회 화면을 구성**하고  
**공정 진행 과정에서 발생하는 복수의 CRUD 작업을 처리**하는 과정이 가장 어려웠습니다.

특히 ***작업 지시, 공정, 설비, 생산 실적*** 등 서로 연관된 데이터가 많아  
초기에는 ***테이블 간 관계를 명확히 파악하지 못해***  
***조회 로직과 데이터 흐름을 설계하는 데 어려움***을 느꼈습니다.  

이를 해결하기 위해 **각 테이블의 역할과 관계를 다시 분석**하고,  
**공정 흐름에 맞게 데이터 처리 순서를 정리**하며  
문제를 해결해 나갔습니다.

이 과정을 통해 **단순 기능 구현보다 데이터 구조 설계와 흐름 이해가  
시스템 완성도에 큰 영향을 준다**는 점을 체감할 수 있었습니다.  

또한 **실제 현장 중심 시스템인 MES에서 정확한 데이터 관리와 실시간 반영의 중요성**을 경험하였으며,  
**복잡한 비즈니스 로직을 단계적으로 분석하고 구현하는 역량**을 기를 수 있었습니다.

---

<p align="center">
  <a href="#프로젝트-개요"><kbd>📘 프로젝트 개요</kbd></a>
  &nbsp;&nbsp;
  <a href="#내-파트"><kbd>🧩 내 파트</kbd></a>
  &nbsp;&nbsp;
  <a href="#프로젝트-소감"><kbd>📝 프로젝트 소감</kbd></a>
  &nbsp;&nbsp;
  <a href="#Project-Structure"><kbd>📁 Project Structure</kbd></a>
</p>

---

## Project Structure

### Client / Server Architecture

<div align="center">
  <table>
    <tr>
      <td align="center" valign="top">
        <b>Client</b><br/>
        <img src="https://github.com/user-attachments/assets/257ac449-1b3c-4361-8918-30f3f4aeca70" width="420"/>
      </td>
      <td align="center" valign="top">
        <b>Server</b><br/>
        <img src="https://github.com/user-attachments/assets/ea9f0251-1d27-4328-ab6a-21e3cc585082" width="420"/>
      </td>
    </tr>
  </table>
</div>

### MY Client / Server Architecture

<div align="center">
  <table>
    <tr>
      <td align="center" valign="top">
        <b>Client</b><br/>
        <img src="https://github.com/user-attachments/assets/d4e55948-5bc2-45c6-bd54-3d5ddfeef7bb" width="420"/>
      </td>
      <td align="center" valign="top">
        <b>Server</b><br/>
        <img src="https://github.com/user-attachments/assets/e5dce849-8a59-46d4-bb0c-3b986505e3df" width="420"/>
      </td>
    </tr>
  </table>

</div>

