## MusicPicker REST API Documentation

---

#### Log in to desired Spotify Account

<details>
 <summary><code>GET</code> <code><b>/api/auth/login</b></code> <code>(redirects to Spotify's auth flow system)</code></summary>

##### Parameters

> None

##### Responses

> | http code | content-type | response                        |
> | --------- | ------------ | ------------------------------- |
> | `302`     | `N/A`        | `Redirect to Spotify auth flow` |

##### Example cURL

> ```javascript
>  curl -X GET --data @post.json http://maindomain.com/api/auth/login
> ```

</details>

---

#### Managing Device's Queue

<details>
 <summary><code>GET</code> <code><b>/api/queue/add/:trackUri</b></code> <code>(add the track to device's queue)</code></summary>

##### Parameters

> | name     | type     | data type | description                                |
> | -------- | -------- | --------- | ------------------------------------------ |
> | trackUri | required | string    | Is Spotify's unique uri for spesific track |

##### Responses

> | http code | content-type                      | response                                                                   |
> | --------- | --------------------------------- | -------------------------------------------------------------------------- |
> | `200`     | `text/plain;charset=UTF-8`        | OK                                                                         |
> | `400`     | `application/json; charset=utf-8` | {messge:"user already added track to queue,...", error_type:"ALREADY_ADD"} |
> | `503`     | `application/json; charset=utf-8` | {message:"has no devices connected"}                                       |
> | `503`     | `application/json; charset=utf-8` | {message:"track exists in current queue",error_type:"EXISTS"}              |

##### Example cURL

> ```javascript
>  curl -X GET --data @post.json http://maindomain.com/api/queue/add/:trackUri
> ```

</details>

---

#### Player

<details>
  <summary><code>GET</code> <code><b>/api/player/current</b></code> <code>(Gets the current state and queue of the player)</code></summary>

##### Parameters

> None

##### Responses

> | http code | content-type               | response                |
> | --------- | -------------------------- | ----------------------- |
> | `200`     | `application/json`         | `{ playerState }`       |
> | `500`     | `text/plain;charset=UTF-8` | `{ device: undefined }` |

##### Example cURL

> ```javascript
>  curl -X GET --data @post.json http://maindomain.com/api/player/current
> ```

</details>
