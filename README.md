# API

### 구조/기능 설명

Node.js의 서버가 켜져 있는 상황에서 React-Native가 get, post 등의 http 메소드로 서버에게 요청을 보내면 Node.js는 React-Native가 보낸 요청에 따라 알맞은 핸들링을 한다.

#### 1. 계정

1-1. 회원가입
1-2. 로그인
1-3. 비밀번호 찾기  
 1-4. 로그아웃  
 1-5. 회원탈퇴

---

### 1. 계정

#### 1-1. 회원가입

- **URL** : /account/signup
- **METHOD** : /POST
- **REQUEST BODY** :

```
{
    "name" : "파람",
    "email":"param@ajou.ac.kr",
    "password":"@2345reqw"
}
```

- **RETURN** :

성공

```
{
    "status": "SUCCESS",
    "message": "회원가입이 성공적으로 완료되었습니다",
    "data": {
        "_id": "6127d6d04850b74aacbb781e",
        "name": "파람",
        "email": "param@ajou.ac.kr",
        "password": "$2b$10$Li4vEUF6ghLMR4OLseVhOOTt2YYrL6Y64.KEXh41TL9cgALkXfOg6",
        "__v": 0
    }
}
```

실패

1. name, email, password 중 한 개라도 비어있을 경우

```
{
    "status": "FAILED",
    "message": "빈 문자열입니다.",
}
```

2. 닉네임 양식에 맞지 않을 경우

```
{
    "status": "FAILED",
    "message": "영어, 한글, 숫자만 허용하며, 2자 이상 8자 이내여야 합니다.",
}
```

3. 이메일 양식에 맞지 않을 경우

```
{
    "status": "FAILED",
    "message": "올바르지 않은 양식입니다.",
}
```

4. 비밀번호 양식에 맞지 않을 경우

```
{
    "status": "FAILED",
    "message": "영어, 숫자, 특수문자 혼용 8자 이상이어야 합니다.",
}
```

5. 이미 가입된 사용자인 경우

```
{
    "status": "FAILED",
    "message": "이미 가입된 사용자입니다.",
}
```

6. 기타

```
{
    "status": "FAILED",
    "message": "(기타 동작) 중 에러가 발생하였습니다.",
}
```

</br>

---

### 어려웠던 점, TroubleShooting

-
