#include <eosio.token/eosio.token.hpp>
#include <eosiolib/eosio.hpp>
#include <eosiolib/asset.hpp>

class cookie_store : public eosio::contract {

  public:
    cookie_store( account_name s ) : contract( s ), _dir_records( s, s ), _bids_records( s, s ), _used_records( s, s ) { }

    ///@abi action
    void directory_create( account_name advertiser, public_key public_key ) {
       eosio_assert( _dir_records.find( advertiser ) == _dir_records.end(), "Record already exists" );

       _dir_records.emplace( get_self(), [&]( auto& rcrd ) {
         rcrd.advertiser = advertiser;
         rcrd.public_key = public_key;
       });
    }

    ///@abi action
    void directory_remove( account_name advertiser ) {
      auto itr = _dir_records.find( advertiser );
      eosio_assert( itr != _dir_records.end(), "Record does not exist" );
      
      _dir_records.erase( itr );
    }

    ///@abi action
    void bids_create( account_name bidder, account_name desired_link, eosio::asset bounty, eosio::asset price_per ) {
       for( auto itr = _bids_records.find( bidder); itr != _bids_records.end(); ++itr ) {
         eosio_assert( itr->desired_link != desired_link, "Record already exists" );
       }

       _bids_records.emplace( get_self(), [&]( auto& rcrd ) {
         rcrd.uuid = _bids_records.available_primary_key();
         rcrd.bidder = bidder;
         rcrd.desired_link = desired_link;
         rcrd.bounty = bounty;
         rcrd.price_per = price_per;
       });
    }

    ///@abi action
    void bids_update( uint64_t uuid, account_name browser, std::string signed_cookie, std::string cookie ) {
      auto itr = _bids_records.find( uuid );
      eosio_assert( itr != _bids_records.end(), "Record does not exist" );

      _bids_records.modify( itr, get_self(), [&]( auto& rcrd ){
        eosio_assert( rcrd.bounty >= rcrd.price_per, "Insufficient funds in bounty" );
        if( valid( signed_cookie, cookie, directory_retrieve( itr->bidder ) ) ) {
          rcrd.bounty -= rcrd.price_per;
          INLINE_ACTION_SENDER( eosio::token, transfer )( N(eosio.token), {{get_self(),N(active)},{browser,N(active)}}, { get_self(), browser, rcrd.price_per, std::string("Bounty payment") } );
        }
      });
    }

    ///@abi action
    void bids_remove( uint64_t uuid ) {
      auto itr = _bids_records.find( uuid );
      eosio_assert( itr != _bids_records.end(), "Record does not exist" );
      
      _bids_records.erase( itr );
    }

    ///@abi action
    void used_cookies_create( uint64_t bounty_uuid, std::string cookie ) { 
      for( auto itr = _used_records.find( bounty_uuid ); itr != _used_records.end(); ++itr ) {
        eosio_assert( (itr->cookie).compare(cookie) != 0, "Record already exists" );
      }

      _used_records.emplace( get_self(), [&]( auto& rcrd ) {
        rcrd.uuid = _used_records.available_primary_key();
        rcrd.bounty_uuid = bounty_uuid;
        rcrd.cookie = cookie;
      });
    }
    
  private:
    /// @abi table dir_records
    struct dir_record {
      account_name advertiser; // primary key
      uint64_t phone;
      public_key public_key;

      uint64_t primary_key() const { return advertiser; }
      uint64_t by_phone() const { return phone; }
    };

    typedef eosio::multi_index<N(records), dir_record, eosio::indexed_by<N(byphone), eosio::const_mem_fun<dir_record, uint64_t, &dir_record::by_phone> > > dir_record_table;

    dir_record_table _dir_records;

    /// @abi table bids_records
    struct bids_record {
      uint64_t uuid; // primary key
      account_name bidder;
      account_name desired_link;
      eosio::asset bounty;
      eosio::asset price_per;

      uint64_t primary_key() const { return uuid; }
      uint64_t by_bidder() const { return bidder; }
    };

    typedef eosio::multi_index<N(records), bids_record, eosio::indexed_by<N(bybidder), eosio::const_mem_fun<bids_record, uint64_t, &bids_record::by_bidder> > > bids_record_table;

    bids_record_table _bids_records;

    struct used_record {
      uint64_t uuid;
      uint64_t bounty_uuid;
      std::string cookie;

      uint64_t primary_key() const { return uuid; }
      uint64_t by_bounty_uuid() const { return bounty_uuid; }
    };

    typedef eosio::multi_index<N(records), used_record, eosio::indexed_by<N(bybidderuuid), eosio::const_mem_fun<used_record, uint64_t, &used_record::by_bounty_uuid> > > used_record_table;

    used_record_table _used_records;

    public_key directory_retrieve( account_name advertiser ) {
      auto itr = _dir_records.find( advertiser );
      eosio_assert( itr != _dir_records.end(), "Record does not exist" );
     
     return itr->public_key;
    }

    bool valid( std::string signed_cookie, std::string cookie, public_key ) { return true; }

};

EOSIO_ABI( cookie_store, (directory_create)(directory_remove)(bids_create)(bids_update)(bids_remove)(used_cookies_create) )
