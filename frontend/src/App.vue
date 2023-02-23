<template>
  <van-form @submit="onSubmit">

    <van-field
        v-model="oid"
        name="oid"
        label="评论区id"
        placeholder="请输入要监控的评论区oid"
        :rules="[{ required: true, message: '请输入要监控的评论区oid' }]"
    />
    <div style="margin: 16px;">
      <van-button round block type="info" native-type="submit">提交</van-button>
    </div>
  </van-form>
  <van-tabs v-model="active">
    <van-tab :title="key" v-for="(value, key, index) in oidCommentListMap">
      <ul id="messages">
        <li v-for="(data, index) in value">
          <img style="width: 32px; height: 32px;" :src="data.avatar"/>
          <span>{{ data.username }}</span>>:
          <p>
            {{ data.comment }}
          </p>
          <p>
            <!--          {{moment(data.ctime).format('yyyy-MM-DD HH:mm:ss')}}-->
          </p>
        </li>
      </ul>
    </van-tab>
  </van-tabs>
</template>

<style scoped>
/*.logo {*/
/*  height: 6em;*/
/*  padding: 1.5em;*/
/*  will-change: filter;*/
/*}*/
/*.logo:hover {*/
/*  filter: drop-shadow(0 0 2em #646cffaa);*/
/*}*/
/*.logo.vue:hover {*/
/*  filter: drop-shadow(0 0 2em #42b883aa);*/
/*}*/
body {
  margin: 0;
  padding-bottom: 3rem;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
}

#form {
  background: rgba(0, 0, 0, 0.15);
  padding: 0.25rem;
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  display: flex;
  height: 3rem;
  box-sizing: border-box;
  backdrop-filter: blur(10px);
}

#input {
  border: none;
  padding: 0 1rem;
  flex-grow: 1;
  border-radius: 2rem;
  margin: 0.25rem;
}

#input:focus {
  outline: none;
}

#form > button {
  background: #333;
  border: none;
  padding: 0 1rem;
  margin: 0.25rem;
  border-radius: 3px;
  outline: none;
  color: #fff;
}

#messages {
  list-style-type: none;
  margin: 0;
  padding: 0;
}

#messages > li {
  padding: 0.5rem 1rem;
}

#messages > li:nth-child(odd) {
  background: #efefef;
}
</style>

<script setup>
// This starter template is using Vue 3 <script setup> SFCs
// Check out https://vuejs.org/api/sfc-script-setup.html#script-setup
import HelloWorld from './components/HelloWorld.vue'
import {ref} from "vue";
import io from "socket.io-client"
import axios from 'axios'

const active = ref(0);
const oid = ref();
const oidCommentListMap = ref({});
// oidCommentListMap.value['1234'] = [{
//   comment: '12345',
//   username: 'aaaaa'
// }]

const onSubmit = async (values) => {
  const oid = values.oid;
  if (oidCommentListMap.value[oid]) {
    alert("已经重复坚听")
    return;
  }
  const res = await axios.get(`http://localhost:3001/add_monitor/${oid}`);
  console.log('res', res);
  oidCommentListMap.value[oid] = [];

}

const socket = io('ws://localhost:3001');

socket.on('sendData', function (data) {
  // alert(JSON.stringify(data));
  const oid = data.oid;
  const replyList = data.dataList;
  const dataList = replyList.map(reply => {
    return {
      ctime: new Date(reply.ctime * 1000),
      comment: reply.content.message,
      username: reply.member.uname,
      avatar: reply.member.avatar,
    }
  })
  // 后段获取的评论动态插入message中
  for (let i = dataList.length - 1; i >= 0; i--) {
    const data = dataList[i];
    oidCommentListMap.value[oid].push(data);
  }
  if (dataList?.length > 0) {
    window.scrollTo(0, document.body.scrollHeight);
  }

});
</script>
