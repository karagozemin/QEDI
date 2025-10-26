/// QEDI LinkTree Test Suite
/// Comprehensive tests for all profile and link management functions
#[test_only]
module qedi::linktree_tests {
    use std::string::{Self, String};
    use sui::test_scenario::{Self as ts, Scenario};
    use sui::clock::{Self, Clock};
    use sui::test_utils;
    use qedi::linktree::{Self, LinkTreeProfile, UsernameRegistry, AdminCap};

    // Test constants
    const ADMIN: address = @0xAD;
    const USER1: address = @0x1;
    const USER2: address = @0x2;
    const USER3: address = @0x3;

    // Helper functions
    fun create_test_clock(scenario: &mut Scenario): Clock {
        clock::create_for_testing(ts::ctx(scenario))
    }

    fun destroy_test_clock(clock: Clock) {
        clock::destroy_for_testing(clock);
    }

    fun valid_username(): String {
        string::utf8(b"testuser")
    }

    fun valid_display_name(): String {
        string::utf8(b"Test User")
    }

    fun valid_bio(): String {
        string::utf8(b"Web3 Developer")
    }

    fun valid_avatar_url(): String {
        string::utf8(b"https://example.com/avatar.png")
    }

    fun valid_theme(): String {
        string::utf8(b"dark")
    }

    fun valid_link_title(): String {
        string::utf8(b"Twitter")
    }

    fun valid_link_url(): String {
        string::utf8(b"https://twitter.com/testuser")
    }

    fun valid_link_icon(): String {
        string::utf8(b"twitter")
    }

    // ===== Initialization Tests =====

    #[test]
    fun test_init_creates_registry() {
        let mut scenario = ts::begin(ADMIN);
        {
            linktree::init_for_testing(ts::ctx(&mut scenario));
        };

        // Check registry was created
        ts::next_tx(&mut scenario, ADMIN);
        {
            assert!(ts::has_most_recent_shared<UsernameRegistry>(), 0);
            assert!(ts::has_most_recent_for_address<AdminCap>(ADMIN), 1);
        };

        ts::end(scenario);
    }

    // ===== Profile Creation Tests =====

    #[test]
    fun test_create_profile_success() {
        let mut scenario = ts::begin(ADMIN);
        
        // Initialize
        {
            linktree::init_for_testing(ts::ctx(&mut scenario));
        };

        // Create profile
        ts::next_tx(&mut scenario, USER1);
        {
            let mut registry = ts::take_shared<UsernameRegistry>(&scenario);
            let clock = create_test_clock(&mut scenario);

            linktree::create_profile(
                &mut registry,
                valid_username(),
                valid_display_name(),
                valid_bio(),
                valid_avatar_url(),
                valid_theme(),
                &clock,
                ts::ctx(&mut scenario)
            );

            destroy_test_clock(clock);
            ts::return_shared(registry);
        };

        // Verify profile was created
        ts::next_tx(&mut scenario, USER1);
        {
            assert!(ts::has_most_recent_for_address<LinkTreeProfile>(USER1), 0);
            
            let profile = ts::take_from_address<LinkTreeProfile>(&scenario, USER1);
            let (owner, username, display_name, bio, avatar_url, theme, link_count, is_verified, total_clicks, _, _) = 
                linktree::get_profile_info(&profile);
            
            assert!(owner == USER1, 1);
            assert!(username == valid_username(), 2);
            assert!(display_name == valid_display_name(), 3);
            assert!(bio == valid_bio(), 4);
            assert!(avatar_url == valid_avatar_url(), 5);
            assert!(theme == valid_theme(), 6);
            assert!(link_count == 0, 7);
            assert!(!is_verified, 8);
            assert!(total_clicks == 0, 9);

            ts::return_to_address(USER1, profile);
        };

        ts::end(scenario);
    }

    #[test]
    #[expected_failure(abort_code = linktree::EUsernameAlreadyTaken)]
    fun test_create_profile_duplicate_username() {
        let mut scenario = ts::begin(ADMIN);
        
        // Initialize
        {
            linktree::init_for_testing(ts::ctx(&mut scenario));
        };

        // User1 creates profile
        ts::next_tx(&mut scenario, USER1);
        {
            let mut registry = ts::take_shared<UsernameRegistry>(&scenario);
            let clock = create_test_clock(&mut scenario);

            linktree::create_profile(
                &mut registry,
                valid_username(),
                valid_display_name(),
                valid_bio(),
                valid_avatar_url(),
                valid_theme(),
                &clock,
                ts::ctx(&mut scenario)
            );

            destroy_test_clock(clock);
            ts::return_shared(registry);
        };

        // User2 tries to create profile with same username (should fail)
        ts::next_tx(&mut scenario, USER2);
        {
            let mut registry = ts::take_shared<UsernameRegistry>(&scenario);
            let clock = create_test_clock(&mut scenario);

            linktree::create_profile(
                &mut registry,
                valid_username(), // Same username!
                string::utf8(b"Different User"),
                string::utf8(b"Different bio"),
                valid_avatar_url(),
                valid_theme(),
                &clock,
                ts::ctx(&mut scenario)
            );

            destroy_test_clock(clock);
            ts::return_shared(registry);
        };

        ts::end(scenario);
    }

    #[test]
    #[expected_failure(abort_code = linktree::EInvalidUsername)]
    fun test_create_profile_username_too_short() {
        let mut scenario = ts::begin(ADMIN);
        
        {
            linktree::init_for_testing(ts::ctx(&mut scenario));
        };

        ts::next_tx(&mut scenario, USER1);
        {
            let mut registry = ts::take_shared<UsernameRegistry>(&scenario);
            let clock = create_test_clock(&mut scenario);

            linktree::create_profile(
                &mut registry,
                string::utf8(b"ab"), // Too short (min is 3)
                valid_display_name(),
                valid_bio(),
                valid_avatar_url(),
                valid_theme(),
                &clock,
                ts::ctx(&mut scenario)
            );

            destroy_test_clock(clock);
            ts::return_shared(registry);
        };

        ts::end(scenario);
    }

    #[test]
    #[expected_failure(abort_code = linktree::EInvalidUsername)]
    fun test_create_profile_username_too_long() {
        let mut scenario = ts::begin(ADMIN);
        
        {
            linktree::init_for_testing(ts::ctx(&mut scenario));
        };

        ts::next_tx(&mut scenario, USER1);
        {
            let mut registry = ts::take_shared<UsernameRegistry>(&scenario);
            let clock = create_test_clock(&mut scenario);

            linktree::create_profile(
                &mut registry,
                string::utf8(b"thisusernameiswaytoolongfortheplatform"), // Too long (max is 20)
                valid_display_name(),
                valid_bio(),
                valid_avatar_url(),
                valid_theme(),
                &clock,
                ts::ctx(&mut scenario)
            );

            destroy_test_clock(clock);
            ts::return_shared(registry);
        };

        ts::end(scenario);
    }

    // ===== Profile Update Tests =====

    #[test]
    fun test_update_profile_success() {
        let mut scenario = ts::begin(ADMIN);
        
        // Setup: Initialize and create profile
        {
            linktree::init_for_testing(ts::ctx(&mut scenario));
        };

        ts::next_tx(&mut scenario, USER1);
        {
            let mut registry = ts::take_shared<UsernameRegistry>(&scenario);
            let clock = create_test_clock(&mut scenario);

            linktree::create_profile(
                &mut registry,
                valid_username(),
                valid_display_name(),
                valid_bio(),
                valid_avatar_url(),
                valid_theme(),
                &clock,
                ts::ctx(&mut scenario)
            );

            destroy_test_clock(clock);
            ts::return_shared(registry);
        };

        // Update profile
        ts::next_tx(&mut scenario, USER1);
        {
            let mut profile = ts::take_from_address<LinkTreeProfile>(&scenario, USER1);
            let clock = create_test_clock(&mut scenario);

            let new_display_name = string::utf8(b"Updated Name");
            let new_bio = string::utf8(b"Updated Bio");
            let new_avatar_url = string::utf8(b"https://example.com/new-avatar.png");
            let new_theme = string::utf8(b"light");

            linktree::update_profile(
                &mut profile,
                new_display_name,
                new_bio,
                new_avatar_url,
                new_theme,
                &clock,
                ts::ctx(&mut scenario)
            );

            // Verify updates
            let (_, username, display_name, bio, avatar_url, theme, _, _, _, _, _) = 
                linktree::get_profile_info(&profile);
            
            assert!(username == valid_username(), 0); // Username should not change
            assert!(display_name == new_display_name, 1);
            assert!(bio == new_bio, 2);
            assert!(avatar_url == new_avatar_url, 3);
            assert!(theme == new_theme, 4);

            destroy_test_clock(clock);
            ts::return_to_address(USER1, profile);
        };

        ts::end(scenario);
    }

    #[test]
    #[expected_failure(abort_code = linktree::ENotProfileOwner)]
    fun test_update_profile_not_owner() {
        let mut scenario = ts::begin(ADMIN);
        
        // Setup: Initialize and create profile
        {
            linktree::init_for_testing(ts::ctx(&mut scenario));
        };

        ts::next_tx(&mut scenario, USER1);
        {
            let mut registry = ts::take_shared<UsernameRegistry>(&scenario);
            let clock = create_test_clock(&mut scenario);

            linktree::create_profile(
                &mut registry,
                valid_username(),
                valid_display_name(),
                valid_bio(),
                valid_avatar_url(),
                valid_theme(),
                &clock,
                ts::ctx(&mut scenario)
            );

            destroy_test_clock(clock);
            ts::return_shared(registry);
        };

        // USER2 tries to update USER1's profile (should fail)
        ts::next_tx(&mut scenario, USER2);
        {
            let mut profile = ts::take_from_address<LinkTreeProfile>(&scenario, USER1);
            let clock = create_test_clock(&mut scenario);

            linktree::update_profile(
                &mut profile,
                string::utf8(b"Hacked Name"),
                string::utf8(b"Hacked Bio"),
                valid_avatar_url(),
                valid_theme(),
                &clock,
                ts::ctx(&mut scenario)
            );

            destroy_test_clock(clock);
            ts::return_to_address(USER1, profile);
        };

        ts::end(scenario);
    }

    // ===== Link Management Tests =====

    #[test]
    fun test_add_link_success() {
        let mut scenario = ts::begin(ADMIN);
        
        // Setup: Initialize and create profile
        {
            linktree::init_for_testing(ts::ctx(&mut scenario));
        };

        ts::next_tx(&mut scenario, USER1);
        {
            let mut registry = ts::take_shared<UsernameRegistry>(&scenario);
            let clock = create_test_clock(&mut scenario);

            linktree::create_profile(
                &mut registry,
                valid_username(),
                valid_display_name(),
                valid_bio(),
                valid_avatar_url(),
                valid_theme(),
                &clock,
                ts::ctx(&mut scenario)
            );

            destroy_test_clock(clock);
            ts::return_shared(registry);
        };

        // Add link
        ts::next_tx(&mut scenario, USER1);
        {
            let mut profile = ts::take_from_address<LinkTreeProfile>(&scenario, USER1);
            let clock = create_test_clock(&mut scenario);

            linktree::add_link(
                &mut profile,
                valid_link_title(),
                valid_link_url(),
                valid_link_icon(),
                &clock,
                ts::ctx(&mut scenario)
            );

            // Verify link was added
            let (_, _, _, _, _, _, link_count, _, _, _, _) = linktree::get_profile_info(&profile);
            assert!(link_count == 1, 0);

            let links = linktree::get_links(&profile);
            assert!(std::vector::length(links) == 1, 1);

            destroy_test_clock(clock);
            ts::return_to_address(USER1, profile);
        };

        ts::end(scenario);
    }

    #[test]
    fun test_add_multiple_links_batch() {
        let mut scenario = ts::begin(ADMIN);
        
        // Setup: Initialize and create profile
        {
            linktree::init_for_testing(ts::ctx(&mut scenario));
        };

        ts::next_tx(&mut scenario, USER1);
        {
            let mut registry = ts::take_shared<UsernameRegistry>(&scenario);
            let clock = create_test_clock(&mut scenario);

            linktree::create_profile(
                &mut registry,
                valid_username(),
                valid_display_name(),
                valid_bio(),
                valid_avatar_url(),
                valid_theme(),
                &clock,
                ts::ctx(&mut scenario)
            );

            destroy_test_clock(clock);
            ts::return_shared(registry);
        };

        // Add multiple links in batch (simulating PTB)
        ts::next_tx(&mut scenario, USER1);
        {
            let mut profile = ts::take_from_address<LinkTreeProfile>(&scenario, USER1);
            let clock = create_test_clock(&mut scenario);

            // Add 5 links
            linktree::add_link(
                &mut profile,
                string::utf8(b"Twitter"),
                string::utf8(b"https://twitter.com/user"),
                string::utf8(b"twitter"),
                &clock,
                ts::ctx(&mut scenario)
            );

            linktree::add_link(
                &mut profile,
                string::utf8(b"Instagram"),
                string::utf8(b"https://instagram.com/user"),
                string::utf8(b"instagram"),
                &clock,
                ts::ctx(&mut scenario)
            );

            linktree::add_link(
                &mut profile,
                string::utf8(b"GitHub"),
                string::utf8(b"https://github.com/user"),
                string::utf8(b"github"),
                &clock,
                ts::ctx(&mut scenario)
            );

            linktree::add_link(
                &mut profile,
                string::utf8(b"LinkedIn"),
                string::utf8(b"https://linkedin.com/in/user"),
                string::utf8(b"linkedin"),
                &clock,
                ts::ctx(&mut scenario)
            );

            linktree::add_link(
                &mut profile,
                string::utf8(b"Website"),
                string::utf8(b"https://example.com"),
                string::utf8(b"globe"),
                &clock,
                ts::ctx(&mut scenario)
            );

            // Verify all links were added
            let (_, _, _, _, _, _, link_count, _, _, _, _) = linktree::get_profile_info(&profile);
            assert!(link_count == 5, 0);

            destroy_test_clock(clock);
            ts::return_to_address(USER1, profile);
        };

        ts::end(scenario);
    }

    #[test]
    #[expected_failure(abort_code = linktree::EMaxLinksReached)]
    fun test_add_link_max_limit() {
        let mut scenario = ts::begin(ADMIN);
        
        // Setup: Initialize and create profile
        {
            linktree::init_for_testing(ts::ctx(&mut scenario));
        };

        ts::next_tx(&mut scenario, USER1);
        {
            let mut registry = ts::take_shared<UsernameRegistry>(&scenario);
            let clock = create_test_clock(&mut scenario);

            linktree::create_profile(
                &mut registry,
                valid_username(),
                valid_display_name(),
                valid_bio(),
                valid_avatar_url(),
                valid_theme(),
                &clock,
                ts::ctx(&mut scenario)
            );

            destroy_test_clock(clock);
            ts::return_shared(registry);
        };

        // Add 51 links (should fail at 51, max is 50)
        ts::next_tx(&mut scenario, USER1);
        {
            let mut profile = ts::take_from_address<LinkTreeProfile>(&scenario, USER1);
            let clock = create_test_clock(&mut scenario);

            let mut i = 0;
            while (i < 51) {
                linktree::add_link(
                    &mut profile,
                    string::utf8(b"Link"),
                    string::utf8(b"https://example.com"),
                    string::utf8(b"link"),
                    &clock,
                    ts::ctx(&mut scenario)
                );
                i = i + 1;
            };

            destroy_test_clock(clock);
            ts::return_to_address(USER1, profile);
        };

        ts::end(scenario);
    }

    #[test]
    fun test_update_link_success() {
        let mut scenario = ts::begin(ADMIN);
        
        // Setup: Initialize, create profile, add link
        {
            linktree::init_for_testing(ts::ctx(&mut scenario));
        };

        ts::next_tx(&mut scenario, USER1);
        {
            let mut registry = ts::take_shared<UsernameRegistry>(&scenario);
            let clock = create_test_clock(&mut scenario);

            linktree::create_profile(
                &mut registry,
                valid_username(),
                valid_display_name(),
                valid_bio(),
                valid_avatar_url(),
                valid_theme(),
                &clock,
                ts::ctx(&mut scenario)
            );

            destroy_test_clock(clock);
            ts::return_shared(registry);
        };

        ts::next_tx(&mut scenario, USER1);
        {
            let mut profile = ts::take_from_address<LinkTreeProfile>(&scenario, USER1);
            let clock = create_test_clock(&mut scenario);

            linktree::add_link(
                &mut profile,
                valid_link_title(),
                valid_link_url(),
                valid_link_icon(),
                &clock,
                ts::ctx(&mut scenario)
            );

            destroy_test_clock(clock);
            ts::return_to_address(USER1, profile);
        };

        // Update link
        ts::next_tx(&mut scenario, USER1);
        {
            let mut profile = ts::take_from_address<LinkTreeProfile>(&scenario, USER1);
            let clock = create_test_clock(&mut scenario);

            linktree::update_link(
                &mut profile,
                0, // First link
                string::utf8(b"Updated Twitter"),
                string::utf8(b"https://twitter.com/newhandle"),
                string::utf8(b"twitter"),
                false, // Deactivate
                &clock,
                ts::ctx(&mut scenario)
            );

            destroy_test_clock(clock);
            ts::return_to_address(USER1, profile);
        };

        ts::end(scenario);
    }

    #[test]
    fun test_remove_link_success() {
        let mut scenario = ts::begin(ADMIN);
        
        // Setup: Initialize, create profile, add 3 links
        {
            linktree::init_for_testing(ts::ctx(&mut scenario));
        };

        ts::next_tx(&mut scenario, USER1);
        {
            let mut registry = ts::take_shared<UsernameRegistry>(&scenario);
            let clock = create_test_clock(&mut scenario);

            linktree::create_profile(
                &mut registry,
                valid_username(),
                valid_display_name(),
                valid_bio(),
                valid_avatar_url(),
                valid_theme(),
                &clock,
                ts::ctx(&mut scenario)
            );

            destroy_test_clock(clock);
            ts::return_shared(registry);
        };

        ts::next_tx(&mut scenario, USER1);
        {
            let mut profile = ts::take_from_address<LinkTreeProfile>(&scenario, USER1);
            let clock = create_test_clock(&mut scenario);

            linktree::add_link(&mut profile, string::utf8(b"Link1"), string::utf8(b"url1"), string::utf8(b"icon1"), &clock, ts::ctx(&mut scenario));
            linktree::add_link(&mut profile, string::utf8(b"Link2"), string::utf8(b"url2"), string::utf8(b"icon2"), &clock, ts::ctx(&mut scenario));
            linktree::add_link(&mut profile, string::utf8(b"Link3"), string::utf8(b"url3"), string::utf8(b"icon3"), &clock, ts::ctx(&mut scenario));

            destroy_test_clock(clock);
            ts::return_to_address(USER1, profile);
        };

        // Remove middle link
        ts::next_tx(&mut scenario, USER1);
        {
            let mut profile = ts::take_from_address<LinkTreeProfile>(&scenario, USER1);
            let clock = create_test_clock(&mut scenario);

            linktree::remove_link(
                &mut profile,
                1, // Remove second link
                &clock,
                ts::ctx(&mut scenario)
            );

            // Verify only 2 links remain
            let (_, _, _, _, _, _, link_count, _, _, _, _) = linktree::get_profile_info(&profile);
            assert!(link_count == 2, 0);

            destroy_test_clock(clock);
            ts::return_to_address(USER1, profile);
        };

        ts::end(scenario);
    }

    #[test]
    fun test_reorder_links_success() {
        let mut scenario = ts::begin(ADMIN);
        
        // Setup: Initialize, create profile, add 3 links
        {
            linktree::init_for_testing(ts::ctx(&mut scenario));
        };

        ts::next_tx(&mut scenario, USER1);
        {
            let mut registry = ts::take_shared<UsernameRegistry>(&scenario);
            let clock = create_test_clock(&mut scenario);

            linktree::create_profile(
                &mut registry,
                valid_username(),
                valid_display_name(),
                valid_bio(),
                valid_avatar_url(),
                valid_theme(),
                &clock,
                ts::ctx(&mut scenario)
            );

            destroy_test_clock(clock);
            ts::return_shared(registry);
        };

        ts::next_tx(&mut scenario, USER1);
        {
            let mut profile = ts::take_from_address<LinkTreeProfile>(&scenario, USER1);
            let clock = create_test_clock(&mut scenario);

            linktree::add_link(&mut profile, string::utf8(b"Link0"), string::utf8(b"url0"), string::utf8(b"icon0"), &clock, ts::ctx(&mut scenario));
            linktree::add_link(&mut profile, string::utf8(b"Link1"), string::utf8(b"url1"), string::utf8(b"icon1"), &clock, ts::ctx(&mut scenario));
            linktree::add_link(&mut profile, string::utf8(b"Link2"), string::utf8(b"url2"), string::utf8(b"icon2"), &clock, ts::ctx(&mut scenario));

            destroy_test_clock(clock);
            ts::return_to_address(USER1, profile);
        };

        // Reorder links: [0, 1, 2] -> [2, 0, 1]
        ts::next_tx(&mut scenario, USER1);
        {
            let mut profile = ts::take_from_address<LinkTreeProfile>(&scenario, USER1);
            let clock = create_test_clock(&mut scenario);

            let mut new_order = std::vector::empty<u64>();
            std::vector::push_back(&mut new_order, 2);
            std::vector::push_back(&mut new_order, 0);
            std::vector::push_back(&mut new_order, 1);

            linktree::reorder_links(
                &mut profile,
                new_order,
                &clock,
                ts::ctx(&mut scenario)
            );

            // Verify link count is still 3
            let (_, _, _, _, _, _, link_count, _, _, _, _) = linktree::get_profile_info(&profile);
            assert!(link_count == 3, 0);

            destroy_test_clock(clock);
            ts::return_to_address(USER1, profile);
        };

        ts::end(scenario);
    }

    #[test]
    fun test_click_link_tracking() {
        let mut scenario = ts::begin(ADMIN);
        
        // Setup: Initialize, create profile, add link
        {
            linktree::init_for_testing(ts::ctx(&mut scenario));
        };

        ts::next_tx(&mut scenario, USER1);
        {
            let mut registry = ts::take_shared<UsernameRegistry>(&scenario);
            let clock = create_test_clock(&mut scenario);

            linktree::create_profile(
                &mut registry,
                valid_username(),
                valid_display_name(),
                valid_bio(),
                valid_avatar_url(),
                valid_theme(),
                &clock,
                ts::ctx(&mut scenario)
            );

            destroy_test_clock(clock);
            ts::return_shared(registry);
        };

        ts::next_tx(&mut scenario, USER1);
        {
            let mut profile = ts::take_from_address<LinkTreeProfile>(&scenario, USER1);
            let clock = create_test_clock(&mut scenario);

            linktree::add_link(
                &mut profile,
                valid_link_title(),
                valid_link_url(),
                valid_link_icon(),
                &clock,
                ts::ctx(&mut scenario)
            );

            destroy_test_clock(clock);
            ts::return_to_address(USER1, profile);
        };

        // Click link 3 times (can be done by anyone, not just owner)
        ts::next_tx(&mut scenario, USER2);
        {
            let mut profile = ts::take_from_address<LinkTreeProfile>(&scenario, USER1);
            let clock = create_test_clock(&mut scenario);

            linktree::click_link(&mut profile, 0, &clock);
            linktree::click_link(&mut profile, 0, &clock);
            linktree::click_link(&mut profile, 0, &clock);

            // Verify click count
            let (_, _, _, _, _, _, _, _, total_clicks, _, _) = linktree::get_profile_info(&profile);
            assert!(total_clicks == 3, 0);

            destroy_test_clock(clock);
            ts::return_to_address(USER1, profile);
        };

        ts::end(scenario);
    }

    // ===== SuiNS Integration Tests =====

    #[test]
    fun test_link_sui_domain_success() {
        let mut scenario = ts::begin(ADMIN);
        
        // Setup: Initialize and create profile
        {
            linktree::init_for_testing(ts::ctx(&mut scenario));
        };

        ts::next_tx(&mut scenario, USER1);
        {
            let mut registry = ts::take_shared<UsernameRegistry>(&scenario);
            let clock = create_test_clock(&mut scenario);

            linktree::create_profile(
                &mut registry,
                valid_username(),
                valid_display_name(),
                valid_bio(),
                valid_avatar_url(),
                valid_theme(),
                &clock,
                ts::ctx(&mut scenario)
            );

            destroy_test_clock(clock);
            ts::return_shared(registry);
        };

        // Link SuiNS domain
        ts::next_tx(&mut scenario, USER1);
        {
            let mut profile = ts::take_from_address<LinkTreeProfile>(&scenario, USER1);
            let clock = create_test_clock(&mut scenario);

            linktree::link_sui_domain(
                &mut profile,
                string::utf8(b"qedi.sui"),
                &clock,
                ts::ctx(&mut scenario)
            );

            // Verify domain was linked
            let (_, _, _, _, _, _, _, _, _, _, sui_domain) = linktree::get_profile_info(&profile);
            assert!(sui_domain == string::utf8(b"qedi.sui"), 0);

            destroy_test_clock(clock);
            ts::return_to_address(USER1, profile);
        };

        ts::end(scenario);
    }

    // ===== Username Registry Tests =====

    #[test]
    fun test_get_profile_by_username() {
        let mut scenario = ts::begin(ADMIN);
        
        // Setup: Initialize and create profile
        {
            linktree::init_for_testing(ts::ctx(&mut scenario));
        };

        ts::next_tx(&mut scenario, USER1);
        {
            let mut registry = ts::take_shared<UsernameRegistry>(&scenario);
            let clock = create_test_clock(&mut scenario);

            linktree::create_profile(
                &mut registry,
                valid_username(),
                valid_display_name(),
                valid_bio(),
                valid_avatar_url(),
                valid_theme(),
                &clock,
                ts::ctx(&mut scenario)
            );

            destroy_test_clock(clock);
            ts::return_shared(registry);
        };

        // Query profile by username
        ts::next_tx(&mut scenario, USER2);
        {
            let registry = ts::take_shared<UsernameRegistry>(&scenario);

            let profile_id_option = linktree::get_profile_by_username(&registry, valid_username());
            assert!(std::option::is_some(&profile_id_option), 0);

            // Test non-existent username
            let nonexistent = linktree::get_profile_by_username(&registry, string::utf8(b"nonexistent"));
            assert!(std::option::is_none(&nonexistent), 1);

            ts::return_shared(registry);
        };

        ts::end(scenario);
    }

    #[test]
    fun test_registry_stats() {
        let mut scenario = ts::begin(ADMIN);
        
        // Initialize
        {
            linktree::init_for_testing(ts::ctx(&mut scenario));
        };

        // Create 3 profiles
        ts::next_tx(&mut scenario, USER1);
        {
            let mut registry = ts::take_shared<UsernameRegistry>(&scenario);
            let clock = create_test_clock(&mut scenario);

            linktree::create_profile(&mut registry, string::utf8(b"user1"), valid_display_name(), valid_bio(), valid_avatar_url(), valid_theme(), &clock, ts::ctx(&mut scenario));

            destroy_test_clock(clock);
            ts::return_shared(registry);
        };

        ts::next_tx(&mut scenario, USER2);
        {
            let mut registry = ts::take_shared<UsernameRegistry>(&scenario);
            let clock = create_test_clock(&mut scenario);

            linktree::create_profile(&mut registry, string::utf8(b"user2"), valid_display_name(), valid_bio(), valid_avatar_url(), valid_theme(), &clock, ts::ctx(&mut scenario));

            destroy_test_clock(clock);
            ts::return_shared(registry);
        };

        ts::next_tx(&mut scenario, USER3);
        {
            let mut registry = ts::take_shared<UsernameRegistry>(&scenario);
            let clock = create_test_clock(&mut scenario);

            linktree::create_profile(&mut registry, string::utf8(b"user3"), valid_display_name(), valid_bio(), valid_avatar_url(), valid_theme(), &clock, ts::ctx(&mut scenario));

            destroy_test_clock(clock);
            ts::return_shared(registry);
        };

        // Check stats
        ts::next_tx(&mut scenario, ADMIN);
        {
            let registry = ts::take_shared<UsernameRegistry>(&scenario);
            let total = linktree::get_registry_stats(&registry);
            assert!(total == 3, 0);
            ts::return_shared(registry);
        };

        ts::end(scenario);
    }

    // ===== Admin Functions Tests =====

    #[test]
    fun test_verify_profile() {
        let mut scenario = ts::begin(ADMIN);
        
        // Setup: Initialize and create profile
        {
            linktree::init_for_testing(ts::ctx(&mut scenario));
        };

        ts::next_tx(&mut scenario, USER1);
        {
            let mut registry = ts::take_shared<UsernameRegistry>(&scenario);
            let clock = create_test_clock(&mut scenario);

            linktree::create_profile(
                &mut registry,
                valid_username(),
                valid_display_name(),
                valid_bio(),
                valid_avatar_url(),
                valid_theme(),
                &clock,
                ts::ctx(&mut scenario)
            );

            destroy_test_clock(clock);
            ts::return_shared(registry);
        };

        // Admin verifies profile
        ts::next_tx(&mut scenario, ADMIN);
        {
            let admin_cap = ts::take_from_address<AdminCap>(&scenario, ADMIN);
            let mut profile = ts::take_from_address<LinkTreeProfile>(&scenario, USER1);
            let clock = create_test_clock(&mut scenario);

            linktree::verify_profile(&admin_cap, &mut profile, &clock);

            // Verify profile is marked as verified
            let (_, _, _, _, _, _, _, is_verified, _, _, _) = linktree::get_profile_info(&profile);
            assert!(is_verified, 0);

            destroy_test_clock(clock);
            ts::return_to_address(ADMIN, admin_cap);
            ts::return_to_address(USER1, profile);
        };

        ts::end(scenario);
    }

    #[test]
    fun test_emergency_transfer() {
        let mut scenario = ts::begin(ADMIN);
        
        // Setup: Initialize and create profile
        {
            linktree::init_for_testing(ts::ctx(&mut scenario));
        };

        ts::next_tx(&mut scenario, USER1);
        {
            let mut registry = ts::take_shared<UsernameRegistry>(&scenario);
            let clock = create_test_clock(&mut scenario);

            linktree::create_profile(
                &mut registry,
                valid_username(),
                valid_display_name(),
                valid_bio(),
                valid_avatar_url(),
                valid_theme(),
                &clock,
                ts::ctx(&mut scenario)
            );

            destroy_test_clock(clock);
            ts::return_shared(registry);
        };

        // Admin transfers profile ownership
        ts::next_tx(&mut scenario, ADMIN);
        {
            let admin_cap = ts::take_from_address<AdminCap>(&scenario, ADMIN);
            let mut profile = ts::take_from_address<LinkTreeProfile>(&scenario, USER1);
            let clock = create_test_clock(&mut scenario);

            linktree::emergency_transfer(&admin_cap, &mut profile, USER2, &clock);

            // Verify new owner
            let (owner, _, _, _, _, _, _, _, _, _, _) = linktree::get_profile_info(&profile);
            assert!(owner == USER2, 0);

            destroy_test_clock(clock);
            ts::return_to_address(ADMIN, admin_cap);
            ts::return_to_address(USER1, profile);
        };

        ts::end(scenario);
    }

    // ===== zkLogin Integration Tests =====

    #[test]
    fun test_set_zklogin_info() {
        let mut scenario = ts::begin(ADMIN);
        
        // Setup: Initialize and create profile
        {
            linktree::init_for_testing(ts::ctx(&mut scenario));
        };

        ts::next_tx(&mut scenario, USER1);
        {
            let mut registry = ts::take_shared<UsernameRegistry>(&scenario);
            let clock = create_test_clock(&mut scenario);

            linktree::create_profile(
                &mut registry,
                valid_username(),
                valid_display_name(),
                valid_bio(),
                valid_avatar_url(),
                valid_theme(),
                &clock,
                ts::ctx(&mut scenario)
            );

            destroy_test_clock(clock);
            ts::return_shared(registry);
        };

        // Set zkLogin info
        ts::next_tx(&mut scenario, USER1);
        {
            let mut profile = ts::take_from_address<LinkTreeProfile>(&scenario, USER1);
            let clock = create_test_clock(&mut scenario);

            linktree::set_zklogin_info(
                &mut profile,
                string::utf8(b"google"),
                string::utf8(b"user@gmail.com"),
                &clock,
                ts::ctx(&mut scenario)
            );

            destroy_test_clock(clock);
            ts::return_to_address(USER1, profile);
        };

        ts::end(scenario);
    }
}

