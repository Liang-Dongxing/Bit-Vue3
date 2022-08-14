import request from '@/utils/request'

// 查询ddns 解析配置列表
export function listDdns(query) {
  return request({
    url: '/ops/ddns/list',
    method: 'get',
    params: query
  })
}

// 查询ddns 解析配置详细
export function getDdns(ddnsId) {
  return request({
    url: '/ops/ddns/' + ddnsId,
    method: 'get'
  })
}

// 新增ddns 解析配置
export function addDdns(data) {
  return request({
    url: '/ops/ddns',
    method: 'post',
    data: data
  })
}

// 修改ddns 解析配置
export function updateDdns(data) {
  return request({
    url: '/ops/ddns',
    method: 'put',
    data: data
  })
}

// 删除ddns 解析配置
export function delDdns(ddnsId) {
  return request({
    url: '/ops/ddns/' + ddnsId,
    method: 'delete'
  })
}
