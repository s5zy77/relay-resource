import { TelephonyBridge } from '../src/voice/telephonyBridge';
import { CONFIG } from '../config/env';

describe('TelephonyBridge - DEMO_MODE Allowlist Safety', () => {
  let bridge: TelephonyBridge;

  beforeEach(() => {
    bridge = new TelephonyBridge();
  });

  test('should allow phone numbers listed in DEMO_ALLOWLIST', () => {
    if (CONFIG.DEMO_ALLOWLIST.length > 0) {
      const validNumber = CONFIG.DEMO_ALLOWLIST[0];
      expect(() => bridge.validateDestination(validNumber)).not.toThrow();
    }
  });

  test('should throw error when calling unauthorized phone numbers in DEMO_MODE', () => {
    const randomUnauthorizedNumber = '+19998887777';
    if (CONFIG.DEMO_MODE) {
      expect(() => bridge.validateDestination(randomUnauthorizedNumber)).toThrow(
        /is not in DEMO_ALLOWLIST/
      );
    }
  });
});
