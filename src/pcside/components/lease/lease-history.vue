<style lang="scss">
	.lease-history{
	}
</style>

<template>
	<div class="lease-history">
		历史纪录
	</div>
</template>

<script>
	export default {
		name: 'lease-history',
		beforeCreate () {
			this.$store.dispatch('updateMenu', '/inner/system/index')
		}
	}
</script>