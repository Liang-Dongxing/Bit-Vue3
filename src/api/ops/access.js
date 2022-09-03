import request from '@/utils/request';

// 查询第三方AccessKey管理列表
export function listAccess(query) {
  return request({
    url: '/ops/access/list',
    method: 'get',
    params: query,
  });
}

// 查询第三方AccessKey管理详细
export function getAccess(accessId) {
  return request({
    url: '/ops/access/' + accessId,
    method: 'get',
  });
}

// 新增第三方AccessKey管理
export function addAccess(data) {
  return request({
    url: '/ops/access',
    method: 'post',
    data: data,
  });
}

// 修改第三方AccessKey管理
export function updateAccess(data) {
  return request({
    url: '/ops/access',
    method: 'put',
    data: data,
  });
}

// 删除第三方AccessKey管理
export function delAccess(accessId) {
  return request({
    url: '/ops/access/' + accessId,
    method: 'delete',
  });
}
