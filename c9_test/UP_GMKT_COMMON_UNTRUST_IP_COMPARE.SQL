/*****************************************************************************************************************
. 작 성 자: 김슬기
. 작 성 일: 2011-08-02
. 유지보수: Accounts팀 김슬기
. 기능구분: Front
. 기능설명: 비인가 IP CIDR BINARY 비교
. 관련기능: neverdie.asp
. 참조SP명:
. 실행예제
grant exec on dbo.up_gmkt_common_untrust_ip_compare to dev
grant exec on dbo.up_gmkt_common_untrust_ip_compare to backend
grant exec on dbo.up_gmkt_common_untrust_ip_compare to goodsdaq

exec dbo.up_gmkt_common_untrust_ip_compare '00111101001101110000000000011111'

select * from dbo.untrust_cidr_binary ucb with(nolock) where cidr like '00111101001101110000000000011111'

*****************************************************************************************************************
변경내역:
			수정일자				수정구분				수정자					수정내용
==============================================================================================================-==


*****************************************************************************************************************/
CREATE PROCEDURE DBO.UP_GMKTNet_COMMON_UNTRUST_IP_COMPARE
/*****************************************************************************************************************
. 작 성 자: 홍상호
. 작 성 일: 2012-10-30
. 유지보수: Architecture팀
. 기능구분: 
. 기능설명: 
. 관련기능: 
. 참조SP명: dbo.UP_GMKT_FRONT_BASKET_INFO_DELETE_ALL
. 실행예제
grant exec on dbo.UP_GMKTNet_Front_DeleteAllCartItem to goodsdaq
grant exec on dbo.UP_GMKTNet_Front_DeleteAllCartItem to dev

EXEC DBO.UP_GMKTNet_Front_DeleteAllCartItem 'A24D9F94-1F99-4F08-B6DF-0D4100CA95FB','N',529000629,'449245489'

*****************************************************************************************************************
변경내역:
수정일자	수정구분	수정자		수정내용
=====================================================================
2012-10-30				홍상호		신규생성

*****************************************************************************************************************/
	@ip_bin			char(32)
as
begin
set nocount on
set transaction isolation level read uncommitted

	select count(*) as untrust_cnt
	from dbo.untrust_cidr_binary ucb with(nolock)
	where ucb.cidr_bin like left(@ip_bin, ucb.bin_len)+'%'
	and use_yn = 'Y'



end