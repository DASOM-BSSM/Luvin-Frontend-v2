// expo-notifications 는 설치만 돼 있어도 iOS 에 푸시 권한(aps-environment)을 붙인다.
// 앱은 회차 공개 로컬 알림만 쓰고 원격 푸시는 쓰지 않으므로 이 권한을 뺀다.
// 남겨 두면 Push Notifications 가 없는 배포 프로비저닝 프로필로 빌드가 실패한다.
// 로컬 알림은 이 권한 없이도 동작한다.
// 같은 파일(entitlements)을 고치는 mod 는 나중에 등록된 것이 먼저 돌기 때문에
// app.json plugins 에서 반드시 expo-notifications 보다 앞에 둬야 마지막에 지울 수 있다.
const { withEntitlementsPlist } = require('expo/config-plugins');

const withNoPushEntitlement = (config) =>
  withEntitlementsPlist(config, (mod) => {
    delete mod.modResults['aps-environment'];
    return mod;
  });

module.exports = withNoPushEntitlement;
