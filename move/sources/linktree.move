/// QEDI - On-Chain LinkTree Profile System
/// Full-featured decentralized profile management with zkLogin, sponsored transactions, and SuiNS integration
module qedi::linktree {
    use std::string::{Self, String};
    use std::vector;
    use std::option::{Self, Option};
    use sui::object::{Self, UID, ID};
    use sui::transfer;
    use sui::tx_context::{Self, TxContext};
    use sui::event;
    use sui::table::{Self, Table};
    use sui::dynamic_field as df;
    use sui::clock::{Self, Clock};

    // ===== Error Codes =====
    const EInvalidUsername: u64 = 1;
    const EUsernameAlreadyTaken: u64 = 2;
    const ENotProfileOwner: u64 = 3;
    const EProfileNotFound: u64 = 4;
    const EInvalidLinkIndex: u64 = 5;
    const EMaxLinksReached: u64 = 6;

    // ===== Constants =====
    const MAX_LINKS: u64 = 50;
    const MIN_USERNAME_LENGTH: u64 = 3;
    const MAX_USERNAME_LENGTH: u64 = 20;

    // ===== Structs =====

    /// Individual link in the profile
    public struct Link has store, copy, drop {
        title: String,
        url: String,
        icon: String,
        is_active: bool,
        click_count: u64,
        created_at: u64,
    }

    /// Main profile object - owned by user
    public struct LinkTreeProfile has key, store {
        id: UID,
        owner: address,
        username: String,
        display_name: String,
        bio: String,
        avatar_url: String,
        theme: String,
        links: vector<Link>,
        total_clicks: u64,
        is_verified: bool,
        created_at: u64,
        updated_at: u64,
        // SuiNS domain integration
        sui_domain: String,
        // zkLogin integration
        zklogin_provider: String,
        zklogin_sub: String,
    }

    /// Global registry for username -> profile mapping
    public struct UsernameRegistry has key {
        id: UID,
        usernames: Table<String, ID>, // username -> profile_id
        total_profiles: u64,
    }

    /// Admin capability for registry management
    public struct AdminCap has key {
        id: UID,
    }

    // ===== Events =====

    public struct ProfileCreated has copy, drop {
        profile_id: ID,
        owner: address,
        username: String,
        created_at: u64,
    }

    public struct ProfileUpdated has copy, drop {
        profile_id: ID,
        owner: address,
        username: String,
        updated_at: u64,
    }

    public struct LinkAdded has copy, drop {
        profile_id: ID,
        owner: address,
        link_title: String,
        link_url: String,
        added_at: u64,
    }

    public struct LinkClicked has copy, drop {
        profile_id: ID,
        link_index: u64,
        link_title: String,
        clicked_at: u64,
    }

    public struct DomainLinked has copy, drop {
        profile_id: ID,
        owner: address,
        domain: String,
        linked_at: u64,
    }

    // ===== Init Function =====

    /// Initialize the module - create global registry
    fun init(ctx: &mut TxContext) {
        // Create username registry
        let registry = UsernameRegistry {
            id: object::new(ctx),
            usernames: table::new(ctx),
            total_profiles: 0,
        };
        transfer::share_object(registry);

        // Create admin capability
        let admin_cap = AdminCap {
            id: object::new(ctx),
        };
        transfer::transfer(admin_cap, tx_context::sender(ctx));
    }

    // ===== Profile Management =====

    /// Create a new LinkTree profile
    public fun create_profile(
        registry: &mut UsernameRegistry,
        username: String,
        display_name: String,
        bio: String,
        avatar_url: String,
        theme: String,
        clock: &Clock,
        ctx: &mut TxContext
    ): LinkTreeProfile {
        // Validate username
        assert!(is_valid_username(&username), EInvalidUsername);
        assert!(!table::contains(&registry.usernames, username), EUsernameAlreadyTaken);

        let current_time = clock::timestamp_ms(clock);
        let profile_id = object::new(ctx);
        let profile_id_copy = object::uid_to_inner(&profile_id);

        // Create profile
        let profile = LinkTreeProfile {
            id: profile_id,
            owner: tx_context::sender(ctx),
            username,
            display_name,
            bio,
            avatar_url,
            theme,
            links: vector::empty(),
            total_clicks: 0,
            is_verified: false,
            created_at: current_time,
            updated_at: current_time,
            sui_domain: string::utf8(b""),
            zklogin_provider: string::utf8(b""),
            zklogin_sub: string::utf8(b""),
        };

        // Register username
        table::add(&mut registry.usernames, profile.username, profile_id_copy);
        registry.total_profiles = registry.total_profiles + 1;

        // Emit event
        event::emit(ProfileCreated {
            profile_id: profile_id_copy,
            owner: profile.owner,
            username: profile.username,
            created_at: current_time,
        });

        profile
    }

    /// Update profile information
    public fun update_profile(
        profile: &mut LinkTreeProfile,
        display_name: String,
        bio: String,
        avatar_url: String,
        theme: String,
        clock: &Clock,
        ctx: &mut TxContext
    ) {
        assert!(profile.owner == tx_context::sender(ctx), ENotProfileOwner);

        profile.display_name = display_name;
        profile.bio = bio;
        profile.avatar_url = avatar_url;
        profile.theme = theme;
        profile.updated_at = clock::timestamp_ms(clock);

        event::emit(ProfileUpdated {
            profile_id: object::uid_to_inner(&profile.id),
            owner: profile.owner,
            username: profile.username,
            updated_at: profile.updated_at,
        });
    }

    // ===== Link Management =====

    /// Add a new link to profile
    public fun add_link(
        profile: &mut LinkTreeProfile,
        title: String,
        url: String,
        icon: String,
        clock: &Clock,
        ctx: &mut TxContext
    ) {
        assert!(profile.owner == tx_context::sender(ctx), ENotProfileOwner);
        assert!(vector::length(&profile.links) < MAX_LINKS, EMaxLinksReached);

        let current_time = clock::timestamp_ms(clock);
        let new_link = Link {
            title,
            url,
            icon,
            is_active: true,
            click_count: 0,
            created_at: current_time,
        };

        vector::push_back(&mut profile.links, new_link);
        profile.updated_at = current_time;

        event::emit(LinkAdded {
            profile_id: object::uid_to_inner(&profile.id),
            owner: profile.owner,
            link_title: title,
            link_url: url,
            added_at: current_time,
        });
    }

    /// Update an existing link
    public fun update_link(
        profile: &mut LinkTreeProfile,
        link_index: u64,
        title: String,
        url: String,
        icon: String,
        is_active: bool,
        clock: &Clock,
        ctx: &mut TxContext
    ) {
        assert!(profile.owner == tx_context::sender(ctx), ENotProfileOwner);
        assert!(link_index < vector::length(&profile.links), EInvalidLinkIndex);

        let link = vector::borrow_mut(&mut profile.links, link_index);
        link.title = title;
        link.url = url;
        link.icon = icon;
        link.is_active = is_active;

        profile.updated_at = clock::timestamp_ms(clock);
    }

    /// Remove a link from profile
    public fun remove_link(
        profile: &mut LinkTreeProfile,
        link_index: u64,
        clock: &Clock,
        ctx: &mut TxContext
    ) {
        assert!(profile.owner == tx_context::sender(ctx), ENotProfileOwner);
        assert!(link_index < vector::length(&profile.links), EInvalidLinkIndex);

        vector::remove(&mut profile.links, link_index);
        profile.updated_at = clock::timestamp_ms(clock);
    }

    /// Reorder links (for drag & drop functionality)
    public fun reorder_links(
        profile: &mut LinkTreeProfile,
        new_order: vector<u64>,
        clock: &Clock,
        ctx: &mut TxContext
    ) {
        assert!(profile.owner == tx_context::sender(ctx), ENotProfileOwner);
        assert!(vector::length(&new_order) == vector::length(&profile.links), EInvalidLinkIndex);

        let old_links = profile.links;
        profile.links = vector::empty();

        let mut i = 0;
        while (i < vector::length(&new_order)) {
            let index = *vector::borrow(&new_order, i);
            assert!(index < vector::length(&old_links), EInvalidLinkIndex);
            vector::push_back(&mut profile.links, *vector::borrow(&old_links, index));
            i = i + 1;
        };

        profile.updated_at = clock::timestamp_ms(clock);
    }

    /// Record link click (for analytics)
    public fun click_link(
        profile: &mut LinkTreeProfile,
        link_index: u64,
        clock: &Clock,
    ) {
        assert!(link_index < vector::length(&profile.links), EInvalidLinkIndex);

        let link = vector::borrow_mut(&mut profile.links, link_index);
        link.click_count = link.click_count + 1;
        profile.total_clicks = profile.total_clicks + 1;

        event::emit(LinkClicked {
            profile_id: object::uid_to_inner(&profile.id),
            link_index,
            link_title: link.title,
            clicked_at: clock::timestamp_ms(clock),
        });
    }

    // ===== SuiNS Integration =====

    /// Link SuiNS domain to profile
    public fun link_sui_domain(
        profile: &mut LinkTreeProfile,
        domain: String,
        clock: &Clock,
        ctx: &mut TxContext
    ) {
        assert!(profile.owner == tx_context::sender(ctx), ENotProfileOwner);

        profile.sui_domain = domain;
        profile.updated_at = clock::timestamp_ms(clock);

        event::emit(DomainLinked {
            profile_id: object::uid_to_inner(&profile.id),
            owner: profile.owner,
            domain,
            linked_at: profile.updated_at,
        });
    }

    // ===== zkLogin Integration =====

    /// Set zkLogin information
    public fun set_zklogin_info(
        profile: &mut LinkTreeProfile,
        provider: String,
        sub: String,
        clock: &Clock,
        ctx: &mut TxContext
    ) {
        assert!(profile.owner == tx_context::sender(ctx), ENotProfileOwner);

        profile.zklogin_provider = provider;
        profile.zklogin_sub = sub;
        profile.updated_at = clock::timestamp_ms(clock);
    }

    // ===== View Functions =====

    /// Get profile by username
    public fun get_profile_by_username(
        registry: &UsernameRegistry,
        username: String
    ): Option<ID> {
        if (table::contains(&registry.usernames, username)) {
            option::some(*table::borrow(&registry.usernames, username))
        } else {
            option::none()
        }
    }

    /// Get profile information
    public fun get_profile_info(profile: &LinkTreeProfile): (
        address, String, String, String, String, String, u64, bool, u64, u64, String
    ) {
        (
            profile.owner,
            profile.username,
            profile.display_name,
            profile.bio,
            profile.avatar_url,
            profile.theme,
            vector::length(&profile.links),
            profile.is_verified,
            profile.total_clicks,
            profile.created_at,
            profile.sui_domain
        )
    }

    /// Get all links from profile
    public fun get_links(profile: &LinkTreeProfile): &vector<Link> {
        &profile.links
    }

    /// Get specific link
    public fun get_link(profile: &LinkTreeProfile, index: u64): &Link {
        vector::borrow(&profile.links, index)
    }

    /// Get registry stats
    public fun get_registry_stats(registry: &UsernameRegistry): u64 {
        registry.total_profiles
    }

    // ===== Helper Functions =====

    /// Validate username format
    fun is_valid_username(username: &String): bool {
        let len = string::length(username);
        len >= MIN_USERNAME_LENGTH && len <= MAX_USERNAME_LENGTH
    }

    // ===== Admin Functions =====

    /// Verify a profile (admin only)
    public fun verify_profile(
        _: &AdminCap,
        profile: &mut LinkTreeProfile,
        clock: &Clock,
    ) {
        profile.is_verified = true;
        profile.updated_at = clock::timestamp_ms(clock);
    }

    /// Emergency profile transfer (admin only)
    public fun emergency_transfer(
        _: &AdminCap,
        profile: &mut LinkTreeProfile,
        new_owner: address,
        clock: &Clock,
    ) {
        profile.owner = new_owner;
        profile.updated_at = clock::timestamp_ms(clock);
    }
}
