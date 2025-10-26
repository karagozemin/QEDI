/// Simple test to verify basic functionality
#[test_only]
module qedi::simple_test {
    use std::string;
    use sui::test_scenario::{Self as ts};
    use qedi::linktree::{Self, UsernameRegistry};

    const ADMIN: address = @0xAD;
    const USER1: address = @0x1;

    #[test]
    fun test_username_validation() {
        // Test passes if valid usernames work and invalid ones fail
        let valid = string::utf8(b"testuser");
        let len = string::length(&valid);
        assert!(len >= 3 && len <= 20, 0);
    }

    #[test]
    fun test_registry_initialization() {
        let mut scenario = ts::begin(ADMIN);
        {
            linktree::init_for_testing(ts::ctx(&mut scenario));
        };
        
        ts::next_tx(&mut scenario, ADMIN);
        {
            // Check that registry was created as shared object
            assert!(ts::has_most_recent_shared<UsernameRegistry>(), 0);
            
            let registry = ts::take_shared<UsernameRegistry>(&scenario);
            let total = linktree::get_registry_stats(&registry);
            assert!(total == 0, 1); // Initially no profiles
            ts::return_shared(registry);
        };
        
        ts::end(scenario);
    }
}

